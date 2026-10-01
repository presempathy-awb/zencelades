package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func validateAddresses(listen, origin, outpost string) error {
	host, port, err := net.SplitHostPort(listen)
	if err != nil || !net.ParseIP(host).IsLoopback() {
		return errors.New("listen must be an explicit loopback IP and port")
	}
	p, err := strconv.Atoi(port)
	if err != nil || p < 1 || p > 65535 {
		return errors.New("invalid listen port")
	}
	for i, raw := range []string{origin, outpost} {
		u, err := url.Parse(raw)
		if err != nil || u.Host == "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" {
			return errors.New("invalid origin or outpost URL")
		}
		localHTTP := u.Scheme == "http" && net.ParseIP(u.Hostname()).IsLoopback()
		if u.Scheme != "https" && !localHTTP {
			return errors.New("URLs require HTTPS except explicit loopback addresses")
		}
		if i == 0 && (u.Path != "" || u.RawPath != "") {
			return errors.New("origin must not include a path")
		}
	}
	return nil
}

func databasePool(ctx context.Context, credentialFile string) (*pgxpool.Pool, error) {
	f, err := os.Open(credentialFile)
	if err != nil {
		return nil, errors.New("database credential file unavailable")
	}
	defer func() {
		if err := f.Close(); err != nil {
			log.Print("Database credential file could not be closed")
		}
	}()
	info, err := f.Stat()
	if err != nil || !info.Mode().IsRegular() || info.Mode().Perm()&0077 != 0 || info.Size() == 0 || info.Size() > 8192 {
		return nil, errors.New("database credential must be a private regular file of at most 8 KB")
	}
	data := make([]byte, info.Size())
	if _, err := f.ReadAt(data, 0); err != nil {
		return nil, errors.New("database credential could not be read")
	}
	config, err := pgxpool.ParseConfig(strings.TrimSpace(string(data)))
	if err != nil {
		return nil, errors.New("invalid database configuration")
	}
	config.MaxConns = 4
	config.ConnConfig.ConnectTimeout = 5 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, errors.New("database connection unavailable")
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, errors.New("database connection unavailable")
	}
	return pool, nil
}

func run(ctx context.Context) error {
	listen := flag.String("listen", "", "Loopback IP:port (required to serve)")
	origin := flag.String("origin", "", "Exact public origin, without trailing slash")
	outpost := flag.String("outpost", "", "Trusted Authentik forward-auth endpoint")
	credential := flag.String("database-url-file", "", "Private file containing the hid-in database URL")
	migrate := flag.Bool("migrate", false, "Print the additive migration; --apply executes it")
	apply := flag.Bool("apply", false, "Apply the requested migration")
	flag.Parse()
	if *apply && !*migrate {
		return errors.New("--apply requires --migrate")
	}
	if *migrate && !*apply {
		fmt.Print(migrationUp)
		return nil
	}
	if !*migrate {
		if err := validateAddresses(*listen, *origin, *outpost); err != nil {
			return err
		}
	}
	startup, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	pool, err := databasePool(startup, *credential)
	if err != nil {
		return err
	}
	defer pool.Close()
	if *migrate {
		if _, err := pool.Exec(startup, migrationUp); err != nil {
			return errors.New("account migration failed")
		}
		fmt.Println("Account migration applied.")
		return nil
	}
	api := accountAPI{auth: outpostAuth{endpoint: *outpost, origin: *origin, client: authClient()}, store: postgresStore{pool: pool, kind: "scenario"}, naming: postgresStore{pool: pool, kind: "naming"}}
	server := http.Server{Addr: *listen, Handler: api.handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16384}
	finished := make(chan error, 1)
	go func() { finished <- server.ListenAndServe() }()
	select {
	case err := <-finished:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return errors.New("account HTTP service stopped unexpectedly")
	case <-ctx.Done():
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdown); err != nil {
			return errors.New("account HTTP shutdown timed out")
		}
		return nil
	}
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	if err := run(ctx); err != nil {
		log.Print(err)
		os.Exit(1)
	}
}
