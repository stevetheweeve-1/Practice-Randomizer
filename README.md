# Random PDF

A local web app that displays one randomly ordered PDF from the `pdfs/` folder every 5 seconds. Each PDF appears once per round before the app reshuffles the collection. It also searches PDFs in nested folders.

## Run it

1. Add your PDF files to `pdfs/`.
2. From this folder, run:

   ```sh
   python3 app.py
   ```

3. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser.

Use **Next now** to advance without waiting; it still will not repeat a PDF within the current round.

Set the number of seconds in **Display each PDF for** and press **Apply** to change the rotation time. Values from 1 to 3,600 seconds are supported.

Use **Choose PDF folder** to select any folder on your computer. Its PDFs become the active rotation for the current browser session; no files are uploaded or copied.

Press **Sound on** once to start the metronome. Press **Sound off** to silence the clicks while keeping the visual beat indicator running. Each displayed PDF receives a random whole-number tempo from 60–120 BPM. Browsers require this one interaction before allowing audio playback.

Use **Stop session** to pause both the PDF rotation and metronome. Press **Resume session** to continue from the displayed PDF.

Set **Time signature** in `x/y` format (for example, `3/4` or `6/8`). The first beat of each measure is played with a louder, higher click.

Use **BPM range** to set inclusive lower and upper limits (1–300). Each new PDF receives a random integer tempo within those limits.
