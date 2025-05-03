// Ensure Photoshop is running and a document is open before running this script.
#target photoshop

/**
 * 将 HH:MM:SS 格式的时间字符串转换为总秒数。
 * @param {string} timeString - HH:MM:SS 格式的时间字符串。
 * @returns {number} - 总秒数。
 */
function timeToSeconds(timeString) {
    var parts = timeString.split(':');
    if (parts.length !== 3) {
        throw new Error("时间格式无效，应为 HH:MM:SS: " + timeString);
    }
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var seconds = parseInt(parts[2], 10);
    return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * 递归查找指定名称的图层，包括嵌套的图层组。
 * @param {object} container - 开始搜索的容器 (文档或图层组)。
 * @param {string} layerName - 要查找的图层名称。
 * @returns {ArtLayer|null} - 找到的图层对象，如果未找到则返回 null。
 */
function findLayerByNameRecursive(container, layerName) {
    // 查找当前容器中的 ArtLayers
    for (var i = 0; i < container.artLayers.length; i++) {
        if (container.artLayers[i].name === layerName) {
            return container.artLayers[i];
        }
    }

    // 递归查找子图层组
    for (var j = 0; j < container.layerSets.length; j++) {
        var foundLayer = findLayerByNameRecursive(container.layerSets[j], layerName);
        if (foundLayer) {
            return foundLayer;
        }
    }

    return null; // 未找到
}

/**
 * 主函数，用于创建基于时间戳的进度条。
 */
function createTimestampProgressBar() {
    // --- 配置 --- 
    // 时间戳数据
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
    // 每个时间段对应的自定义文本 (数组长度必须与 timeStamps 一致)
    var customTexts = [
        "开头",
        "技能讲解",
        "机制详解",
        "影画收益",
        "角色小结",
        "养成配装",
        "实战配队",
        "结尾",
    ];
    // 刻度图层的名称 (请确保与你的 Photoshop 文档中实际使用的图层名称一致，可以是中文、英文或其他语言)
    var scaleLayerName = "刻度"; // 例如: "Scale" 或 "刻度"
    // 示例文本图层的名称 (请确保与你的 Photoshop 文档中实际使用的图层名称一致，可以是中文、英文或其他语言)
    var sampleTextLayerName = "示例文本"; // 例如: "Sample Text" 或 "示例文本"
    // --- 配置结束 ---

    if (app.documents.length === 0) {
        alert("请先打开一个 Photoshop 文档。");
        return;
    }

    var doc = app.activeDocument;
    var docWidth = doc.width.as('px'); // 获取文档宽度（像素）

    // 检查时间戳和自定义文本数组长度是否一致
    if (timeStamps.length !== customTexts.length) {
        alert("错误：时间戳数组 (timeStamps) 和自定义文本数组 (customTexts) 的长度不一致。");
        return;
    }

    // 递归查找刻度图层
    var scaleLayer = findLayerByNameRecursive(doc, scaleLayerName);
    if (!scaleLayer) {
        alert("错误：找不到名为 '" + scaleLayerName + "' 的图层。请确保该图层存在于文档中（可以位于图层组内）。");
        return;
    }
    var scaleLayerY = scaleLayer.bounds[1].as('px'); // 获取原始刻度图层的 Y 坐标

    // 递归查找示例文本图层
    var sampleTextLayer = findLayerByNameRecursive(doc, sampleTextLayerName);
    if (!sampleTextLayer || sampleTextLayer.kind !== LayerKind.TEXT) {
        alert("错误：找不到名为 '" + sampleTextLayerName + "' 的文本图层。请确保该图层存在且为文本图层。");
        return;
    }
    var sampleTextLayerY = sampleTextLayer.textItem.position[1].as('px'); // 获取示例文本图层的 Y 坐标

    // 计算总时长（秒）
    var totalSeconds = 0;
    var segmentSeconds = [];
    for (var i = 0; i < timeStamps.length; i++) {
        try {
            var seconds = timeToSeconds(timeStamps[i]);
            segmentSeconds.push(seconds);
            totalSeconds += seconds;
        } catch (e) {
            alert("处理时间戳时出错: " + e.message);
            return;
        }
    }

    if (totalSeconds <= 0) {
        alert("总时长为零或负数，无法创建进度条。");
        return;
    }

    // 创建一个新的图层组来存放进度条元素
    var progressBarGroup = doc.layerSets.add();
    progressBarGroup.name = "时间戳进度条";

    var currentX = 0; // 当前绘制位置的 X 坐标

    // 遍历每个时间段
    for (var j = 0; j < segmentSeconds.length; j++) {
        var segmentDuration = segmentSeconds[j];
        var segmentWidth = (segmentDuration / totalSeconds) * docWidth;
        var segmentEndX = currentX + segmentWidth;
        var segmentCenterX = currentX + segmentWidth / 2;

        // 复制示例文本图层并设置内容和位置
        var textLayer = sampleTextLayer.duplicate(progressBarGroup, ElementPlacement.PLACEATBEGINNING);
        textLayer.name = customTexts[j]; // 使用自定义文本作为图层名
        textLayer.textItem.contents = customTexts[j]; // 设置文本内容
        // 设置文本水平居中，垂直位置使用示例文本图层的 Y 坐标
        textLayer.textItem.position = [new UnitValue(segmentCenterX, 'px'), new UnitValue(sampleTextLayerY, 'px')];
        // 确保文本居中对齐
        if (textLayer.textItem.justification !== Justification.CENTER) {
            textLayer.textItem.justification = Justification.CENTER;
        }

        // 添加刻度线（除了最后一个片段）
        if (j < segmentSeconds.length - 1) {
            var duplicatedScaleLayer = scaleLayer.duplicate(progressBarGroup, ElementPlacement.PLACEATBEGINNING);
            // 移动刻度线到段落末尾
            // 假设刻度线本身有宽度，我们将其中心对准 segmentEndX
            var scaleBounds = duplicatedScaleLayer.bounds;
            var scaleWidth = scaleBounds[2].as('px') - scaleBounds[0].as('px');
            // 计算刻度线的 X 坐标，使其中心对齐 segmentEndX
            var scaleX = segmentEndX - scaleWidth / 2;
            // 使用原始刻度图层的 Y 坐标进行定位
            // 注意：translate 是相对移动，所以需要计算差值
            var deltaX = scaleX - scaleBounds[0].as('px');
            var deltaY = scaleLayerY - scaleBounds[1].as('px');
            duplicatedScaleLayer.translate(new UnitValue(deltaX, 'px'), new UnitValue(deltaY, 'px'));
            duplicatedScaleLayer.name = "刻度 " + (j + 1);
        }

        // 更新下一个段落的起始 X 坐标
        currentX = segmentEndX;
    }

    // 隐藏原始刻度图层（如果需要）
    // scaleLayer.visible = false;

    alert("进度条创建完成！");
}

// 运行主函数
createTimestampProgressBar();