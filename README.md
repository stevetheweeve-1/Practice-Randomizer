# Random PDF

A local web app that displays PDFs from a folder you choose on your computer. Each PDF appears once per round before the app reshuffles the collection.

## Run it

1. From this folder, run:

   ```sh
   python3 app.py
   ```

2. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser.

Use **Next now** to advance without waiting; it still will not repeat a PDF within the current round.

Set the number of seconds in **Display each PDF for** and press **Apply** to change the rotation time. Values from 1 to 3,600 seconds are supported.

Use **Choose PDF folder** to select any folder on your computer. Its PDFs become the active rotation for the current browser session; no files are uploaded or copied.

For a piece with both sectional and whole-piece practice, keep one parent folder containing `practice-settings.json`, a `Sections/` subfolder, and optionally a `Full Piece/` subfolder. **Sections (random)** rotates PDFs in `Sections/`; **One Section** lets you choose any PDF in that same parent folder and keeps it displayed while tempo and dynamics refresh each interval.

Use **Total session time** to set the length of the whole round in minutes. The app divides that time across every PDF, distributing any extra seconds so the total is exact. In **One Section** mode, it instead sets the total practice duration and shows a second countdown timer. Press **Apply** beside the per-PDF duration to return to manual timing. With the Build up tempo method, every calculated PDF duration must be at least 60 seconds.

Press **Sound on** once to start the metronome. Press **Sound off** to silence the clicks while keeping the visual beat indicator running. Browsers require this one interaction before allowing audio playback.

Use **Stop session** to pause PDF rotation while the metronome continues at its current tempo. Press **Resume session** to continue the displayed PDF with its remaining time and Build up progression.

Choose the folder and practice settings on the setup screen first. Starting the session switches to a focused PDF practice screen; use **End session** to return to setup.

Set **Time signature** in `x/y` format (for example, `3/4` or `6/8`). The first beat of each measure is played with a louder, higher click.

Use **BPM range** to set inclusive lower and upper limits (1–300) for the Random BPM and Build up methods.

stephen adding stuff

## Folder-specific practice settings

To give one PDF folder its own tempo range and time signature, add a file named
`practice-settings.json` at the top level of that folder:

```json
{
  "minBpm": 72,
  "maxBpm": 108,
  "timeSignature": "7/8",
  "targetTempo": 120
}
```

All three values are required. `minBpm` and `maxBpm` must be whole numbers from
1 to 300, with the minimum no greater than the maximum. The time signature must
use a numerator from 1 to 32 and a denominator of 1, 2, 4, 8, or 16. `targetTempo` is optional and must be a whole number from 1 to 300. If it is omitted, the app uses the value in its Target tempo field (60 BPM by default). The metronome continues at the target BPM after the PDF round completes, until **End session** is selected.

Use **Tempo method** to choose **Random BPM**, **Half target**, or **Build up**. Build up requires a display time of at least 60 seconds. It resets to the low BPM whenever a new PDF appears, then calculates equal 30-second increases that reach the high BPM before the next PDF. Tempo method is chosen in the app and is not read from `practice-settings.json`; it defaults to Random BPM. If the file is absent or invalid, the app uses its normal starting values.

Turn **Dynamics practice** on to display one randomly selected instruction for each PDF: piano, mezzo-piano, mezzo-forte, forte, crescendo, or decrescendo. The instruction remains until the next PDF appears. Dynamics practice defaults to off and is configured only in the app.
