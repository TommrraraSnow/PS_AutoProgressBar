# Photoshop Timestamp Progress Bar Script

[中文版](README.md) | English Version

This is an Adobe Photoshop script (JSX) designed to automatically generate video progress bar-style markers based on a series of timestamps. It calculates the relative length of each time segment and creates proportionally distributed text labels and separator ticks within the document.

## Features

* Reads a user-defined list of timestamps (in `HH:MM:SS` format).
* Reads a user-defined list of custom text labels corresponding to each timestamp.
* Calculates the proportion of the total duration for each time segment based on the timestamps.
* Creates progress bar elements proportionally based on the document width in the currently open Photoshop document.
* Finds a user-specified "Scale" layer and duplicates it as a separator line at the end of each time segment (except the last one).
* Finds a user-specified "Sample Text" layer, copies its style and vertical position, and uses the custom text content to create centered labels for each time segment.
* Places all newly created layers (scale duplicates and text labels) into a new layer group named "Timestamp Progress Bar".
* Can recursively find "Scale" and "Sample Text" layers located within nested layer groups.

## Dependencies

1. **Adobe Photoshop**: Photoshop needs to be installed and running.
2. **PSD Document**:
   * A Photoshop document must be open as the target canvas.
   * The document must contain a layer named **"Scale"** (can be any layer type, used as a separator).
   * The document must contain a **text layer** named **"Sample Text"** (its style and vertical position will be used as a template).

## Configuration

Before running the script, you can directly edit the configuration section at the top of the `AutoProgressBar_EN.jsx` file:

```javascript
    // --- Configuration ---
    // Timestamp data (HH:MM:SS format)
    var timeStamps = [
        "00:00:13",
        "00:05:26",
        // ... more timestamps
    ];
    // Custom text for each time segment (array length must match timeStamps)
    var customTexts = [
        "Text 1",
        "Text 2",
        // ... more text
    ];
    // Name of the scale layer (ensure it matches the actual layer name in your Photoshop document, can be in any language)
    var scaleLayerName = "Scale"; // e.g., "Scale" or "刻度"
    // Name of the sample text layer (ensure it matches the actual layer name in your Photoshop document, can be in any language)
    var sampleTextLayerName = "Sample Text"; // e.g., "Sample Text" or "示例文本"
    // --- Configuration End ---
```
