# Character rig feasibility — October 5

The existing Showtime participant remains the broad, shirtless, navy-shorts
interpretation of Andrew's reference. The free rig acquired below is a generic
stylized base and has not replaced that participant or been described as a scan.

## Acquired original and packed model

Quaternius's [Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html)
links to the official [itch.io download](https://quaternius.itch.io/universal-base-characters).
The free Standard archive supplies male and female superhero bases; the other
body types and source Blender package are paid. Its included license states
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

The retained original is
`source/research/enceladus-avatar/originals/Universal Base Characters[Standard].zip`:
128,968,391 bytes, SHA-256
`fdbf1804c90dfc1ea03e992bff7da2dfd1a79318e13270a660180f9308455f40`.
No archive program was executed.

The packed candidate is
`source/research/enceladus-avatar/generated/quaternius-superhero-male.glb`:
15,479,692 bytes, SHA-256
`ee75d0a941ff0998dd29f9b7bfaf88d6f318999cb01197d49b368ba3765ae1c5`.
The original glTF geometry, skin weights, inverse-bind matrices and 65-joint
hierarchy are preserved. Its single binary buffer and seven PNG images are
embedded in one GLB. Two broken original texture URI spellings were resolved
to the existing same-directory `T_Hair_1_Normal.png` and `T_Eye_Normal.png`;
the original archive was not modified. The license stays beside the candidate.

## Native runtime proof

The installed Babylon.js 9.26.1 loader imported one skeleton, 65 bones and three
meshes. The body has 7,281 vertices. A native `AnimationGroup` applied a bounded
upper-arm quaternion change to its linked transform node. CPU skinning changed
the body coordinates by up to 0.372935 metres, all coordinates remained finite,
and returning to the first frame restored the original coordinates exactly.
Materials were skipped for this headless geometry check; browser appearance,
portrait likeness, sitting fit and three-view capture acceptance remain untested.
The pack contains no animation clips, so acquiring it alone does not supply a
natural sitting, standing or reclining library.

[Babylon's animation documentation](https://doc.babylonjs.com/features/featuresDeepDive/animation/rootMotion/)
describes native `AnimationGroup` support. No extra animation plugin is required
for authored skeletal clips. The installed `Physics/v2/ragdoll` implementation
is experimental and requires a skeleton and a compatible physics plugin;
passive ragdoll dynamics do not provide intentional natural movement routines.
No new production dependency or physics plugin was installed.

The next fidelity boundary is an Andrew-approved body/face asset and matching
clothes, followed by authored/retargeted routines, collision/entrance limits and
three-camera acceptance. A generic free rig is sufficient to test skeletal
plumbing, but cannot establish Andrew's real appearance or live body tracking.
