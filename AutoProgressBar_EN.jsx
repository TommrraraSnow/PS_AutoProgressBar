// Ensure Photoshop is running and a document is open before running this script.
#target photoshop

/**
 * Converts a time string in HH:MM:SS format to total seconds.
 * @param {string} timeString - Time string in HH:MM:SS format.
 * @returns {number} - Total seconds.
 */
function timeToSeconds(timeString) {
    var parts = timeString.split(':');
    if (parts.length !== 3) {
        throw new Error("Invalid time format, should be HH:MM:SS: " + timeString);
    }
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var seconds = parseInt(parts[2], 10);
    return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Recursively finds a layer by name, including nested layer sets.
 * @param {object} container - The container to start searching from (document or layer set).
 * @param {string} layerName - The name of the layer to find.
 * @returns {ArtLayer|null} - The found layer object, or null if not found.
 */
function findLayerByNameRecursive(container, layerName) {
    // Find ArtLayers in the current container
    for (var i = 0; i < container.artLayers.length; i++) {
        if (container.artLayers[i].name === layerName) {
            return container.artLayers[i];
        }
    }

    // Recursively search child layer sets
    for (var j = 0; j < container.layerSets.length; j++) {
        var foundLayer = findLayerByNameRecursive(container.layerSets[j], layerName);
        if (foundLayer) {
            return foundLayer;
        }
    }

    return null; // Not found
}

/**
 * Main function to create a timestamp-based progress bar.
 */
function createTimestampProgressBar() {
    // --- Configuration ---
    // Timestamp data
    var timeStamps = [
        "00:00:13",
        "00:05:26",
        "00:07:27",
        "00:03:29",
        "00:00:40",
        "00:04:04",
        "00:01:46",
        "00:00:30"
    ];
    // Custom text for each time segment (array length must match timeStamps)
    // You can customize these default English texts
    var customTexts = [
        "Intro",
        "Skill Explanation",
        "Mechanics Details",
        "Benefits", // Example: Simplified from 'Shadowgraph Benefits'
        "Character Summary",
        "Build & Gear",
        "Team Comp",
        "Outro",
    ];
    // Name of the scale layer (ensure it matches the actual layer name in your Photoshop document)
    var scaleLayerName = "Scale"; // Example: "Scale"
    // Name of the sample text layer (ensure it matches the actual layer name in your Photoshop document)
    var sampleTextLayerName = "Sample Text"; // Example: "Sample Text"
    // --- Configuration End ---

    if (app.documents.length === 0) {
        alert("Please open a Photoshop document first.");
        return;
    }

    var doc = app.activeDocument;
    var docWidth = doc.width.as('px'); // Get document width (pixels)

    // Check if the lengths of timeStamps and customTexts arrays match
    if (timeStamps.length !== customTexts.length) {
        alert("Error: The lengths of the timeStamps array and the customTexts array do not match.");
        return;
    }

    // Recursively find the scale layer
    var scaleLayer = findLayerByNameRecursive(doc, scaleLayerName);
    if (!scaleLayer) {
        alert("Error: Cannot find the layer named '" + scaleLayerName + "'. Please ensure the layer exists in the document (can be within a layer set).");
        return;
    }
    var scaleLayerY = scaleLayer.bounds[1].as('px'); // Get the Y coordinate of the original scale layer

    // Recursively find the sample text layer
    var sampleTextLayer = findLayerByNameRecursive(doc, sampleTextLayerName);
    if (!sampleTextLayer || sampleTextLayer.kind !== LayerKind.TEXT) {
        alert("Error: Cannot find the text layer named '" + sampleTextLayerName + "'. Please ensure the layer exists and is a text layer.");
        return;
    }
    var sampleTextLayerY = sampleTextLayer.textItem.position[1].as('px'); // Get the Y coordinate of the sample text layer

    // Calculate total duration (seconds)
    var totalSeconds = 0;
    var segmentSeconds = [];
    for (var i = 0; i < timeStamps.length; i++) {
        try {
            var seconds = timeToSeconds(timeStamps[i]);
            segmentSeconds.push(seconds);
            totalSeconds += seconds;
        } catch (e) {
            alert("Error processing timestamp: " + e.message);
            return;
        }
    }

    if (totalSeconds <= 0) {
        alert("Total duration is zero or negative, cannot create progress bar.");
        return;
    }

    // Create a new layer set to hold the progress bar elements
    var progressBarGroup = doc.layerSets.add();
    progressBarGroup.name = "Timestamp Progress Bar";

    var currentX = 0; // Current drawing position X coordinate

    // Iterate through each time segment
    for (var j = 0; j < segmentSeconds.length; j++) {
        var segmentDuration = segmentSeconds[j];
        var segmentWidth = (segmentDuration / totalSeconds) * docWidth;
        var segmentEndX = currentX + segmentWidth;
        var segmentCenterX = currentX + segmentWidth / 2;

        // Duplicate the sample text layer and set its content and position
        var textLayer = sampleTextLayer.duplicate(progressBarGroup, ElementPlacement.PLACEATBEGINNING);
        textLayer.name = customTexts[j]; // Use custom text as layer name
        textLayer.textItem.contents = customTexts[j]; // Set text content
        // Set text horizontally centered, use the Y coordinate of the sample text layer for vertical position
        textLayer.textItem.position = [new UnitValue(segmentCenterX, 'px'), new UnitValue(sampleTextLayerY, 'px')];
        // Ensure text is center-aligned
        if (textLayer.textItem.justification !== Justification.CENTER) {
            textLayer.textItem.justification = Justification.CENTER;
        }

        // Add scale line (except for the last segment)
        if (j < segmentSeconds.length - 1) {
            var duplicatedScaleLayer = scaleLayer.duplicate(progressBarGroup, ElementPlacement.PLACEATBEGINNING);
            // Move the scale line to the end of the segment
            // Assuming the scale line has width, align its center to segmentEndX
            var scaleBounds = duplicatedScaleLayer.bounds;
            var scaleWidth = scaleBounds[2].as('px') - scaleBounds[0].as('px');
            // Calculate the X coordinate of the scale line to center-align it with segmentEndX
            var scaleX = segmentEndX - scaleWidth / 2;
            // Use the Y coordinate of the original scale layer for positioning
            // Note: translate is relative movement, so calculate the difference
            var deltaX = scaleX - scaleBounds[0].as('px');
            var deltaY = scaleLayerY - scaleBounds[1].as('px');
            duplicatedScaleLayer.translate(new UnitValue(deltaX, 'px'), new UnitValue(deltaY, 'px'));
            duplicatedScaleLayer.name = "Scale " + (j + 1);
        }

        // Update the starting X coordinate for the next segment
        currentX = segmentEndX;
    }

    // Hide the original scale layer (if needed)
    // scaleLayer.visible = false;

    alert("Progress bar creation complete!");
}

// Run the main function
createTimestampProgressBar();