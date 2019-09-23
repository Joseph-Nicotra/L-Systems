// jshint esversion:8

// Initialize data array for input values
let data = [];
// Initialize amount of iterations to do
let iterations = 1;
let drawTime = 10;
let coords;
let presets = {
    // Name: [Axiom, Angle, [[Percent, Input, Output]]]
    "Hilbert": ["A", 90, [
        [100, "A", "-BF+AFA+FB-"],
        [100, "B", "+AF-BFB-FA+"]
    ]],
    "Hilbert II": ["L", 90, [
        [100, "L", "LFRFL-F-RFLFR+F+LFRFL"],
        [100, "R", "RFLFR+F+LFRFL-F-RFLFR"]
    ]],
    "Koch": ["F", 90, [
        [100, "F", "F-F+F+F-F"]
    ]],
    "Koch 60°": ["F", 60, [
        [100, "F", "F-F++F-F"]
    ]],
    "Koch Snowflake": ["F++F++F", 60, [
        [100, "F", "F-F++F-F"]
    ]],
    "Inverse Koch Snowflake": ["F--F--F", 60, [
        [100, "F", "F-F++F-F"]
    ]],
    "Cesaro-Koch": ["F", 85, [
        [100, "F", "F-F++F-F"]
    ]],
    "Peano": ["F", 90, [
        [100, "F", "F+F-F-F-F+F+F+F-F"]
    ]],
    "Peano-Gosper Curve": ["FX", 60, [
        [100, "X", "X+YF++YF-FX--FXFX-YF+"],
        [100, "Y", "-FX+YFYF++YF+FX--FX-Y"]
    ]],
    "Heighway Dragon": ["FX", 90, [
        [100, "X", "X+YF+"],
        [100, "Y", "-FX-Y"]
    ]],
    "Twin Dragon": ["FX+FX+", 90, [
        [100, "X", "X+YF"],
        [100, "Y", "FX-Y"]
    ]],
    "Terdragon": ["F", 120, [
        [100, "F", "F+F-F"]
    ]],
    "Lévy C Curve": ["F", 45, [
        [100, "F", "+F--F+"]
    ]],
    "32 Segment Curve": ["F+F+F+F", 90, [
        [100, "F", "-F+F-F-F+F+FF-F+F+FF+F-F-FF+FF-FF+F+F-FF-F-F+FF-F-F+F+F-F+"]
    ]],
    "Quadric Koch Island": ["F+F+F+F", 90, [
        [100, "F", "F-F+F+FFF-F-F+F"]
    ]],
    "Quadratic Koch Island 2": ["F-F-F-F", 90, [
        [100, "F", "FF-F-F-F-F-F+F"]
    ]],
    "Quadratic Snowflake": ["F-F-F-F", 90, [
        [100, "F", "FF-F-F-F-FF"]
    ]],
    "Sierpinski Arrowhead": ["YF", 60, [
        [100, "X", "YF+XF+Y"],
        [100, "Y", "XF-YF-X"]
    ]],
    "Sierpinski Triangle": ["FXF--FF--FF", 60, [
        [100, "F", "FF"],
        [100, "X", "--FXF++FXF++FXF--"]
    ]],
    "Tree": ["---X", 30, [
        [100, "X", "F[+X][-X]FX"],
        [100, "F", "FF"]
    ]],
    "Fern": ["----X", 22.5, [
        [100, "F", "FF"],
        [50, "X", "F-[[X]+X]+F[+FX]-X"],
        [50, "X", "F+[[X]-X]-F[-FX]+X"]
    ]],
    "Custom": ["", "", [
        ["", "", ""]
    ]]
};

// On document ready
$(function () {
    // Add presets to dropdown
    for (let preset in presets) {
        $("#systems").append(`<option value="${preset}">${preset}</option>`);
    }
});

function setup() {
    // Create canvas
    let canvas = createCanvas(innerWidth * 0.7, innerHeight);
    // Make canvas child of content section
    canvas.parent("content");
    // Set background to gray
    frameRate(30);
    noLoop();
    background(0);
}

// Auto resize canvas to fit page
function windowResized() {
    resizeCanvas(innerWidth * 0.7, innerHeight);
    background(0);
}

function loadPreset(name) {
    let preset = presets[name];
    // Set axiom
    $("#axiom").val(preset[0]);
    // Set angle
    $("#angle").val(preset[1]);
    // Remove all current rows
    $("#rules tr:not(:last)").remove();
    // Loop through preset rows
    for (let row of preset[2]) {
        // Add new row
        addRuleRow();
        // Get added row
        let element = $("#rules tr:nth-last-of-type(2)");
        // Set values
        element.children().eq(0).children().eq(0).val(row[0]);
        element.children().eq(1).children().eq(0).val(row[1]);
        element.children().eq(2).children().eq(0).val(row[2]);
    }
    recalculateData();
}

// Called when + button clicked
function addRuleRow() {
    // Insert new row html before last row (So + button stays at bottom)
    $(`<tr class="rule">
<td><input type="number" min="0" max="100" autocomplete="off" oninput="validatePercent(this)"></td>
<td><input type="text" maxlength="1" autocomplete="off" oninput="validateInput(this)"></td>
<td><input type="text" style="text-align: left; padding-left: 5px;"
    autocomplete="off" oninput="validateOutput(this)"></td>
<td><button onClick="removeRuleRow(this)">&#65293;</button></td
</tr>`).insertBefore("#rules tbody tr:last-of-type");
    recalculateData();
}

// Called when - button clicked
function removeRuleRow(element) {
    // Delete row element
    $(element).parent().parent().remove();
    recalculateData();
}

// Called when percents column changed
function validatePercent(element) {
    // Limit value between 0 and 100 (Inclusive)
    element.value = element.value.match(/[0-9]*/g || []).join("");
    if (Number(element.value) < 0 || Number(element.value) > 100) $(element).css("color", "red");
    else $(element).css("color", "black");
    recalculateData();
}

// Called when input column changed
function validateInput(element) {
    // Only allow letters
    element.value = element.value.match(/[a-zA-Z]/g);
    recalculateData();
}

// Called when output column changed
function validateOutput(element) {
    // Only allow letters, +, -, [, and ]
    element.value = (element.value.match(/[a-zA-Z]|\+|\-|\[|\]/g) || []).join("");
    recalculateData();
}

// Called when angle changed
function validateAngle(element) {
    // Limit value between -360 and 360 (Inclusive)
    element.value = element.value.match(/-?[0-9]*/g || []).join("");
    if (Number(element.value) < -360 || Number(element.value) > 360) $(element).css("color", "red");
    else $(element).css("color", "black");
    recalculateData();
}

function recalculateData() {
    data = [];
    // Get all but last row in rules table
    let rows = $("#rules tr:not(:last)");
    for (let i = 0; i < rows.length; i++) {
        let row = $(rows[i]);
        data.push([]);
        let cols = row.children().not(":last");
        for (let j = 0; j < cols.length; j++) {
            let col = $(cols[j]).children()[0];
            data[i].push((j == 0) ? Number(col.value) : col.value);
        }
    }
    validateData();
}

function validateData() {
    let valid = true;
    // Check if percents are valid
    let percents = {};
    for (let row of data) {
        if (row[1] in percents) percents[row[1]] += row[0];
        else percents[row[1]] = row[0];
    }
    let rows = $("#rules tr:not(:last)");
    for (let i = 0; i < rows.length; i++) {
        let row = $(rows[i]);
        let cols = row.children().not(":last");
        let val = $(cols[1]).children()[0].value;
        valid = percents[val] == 100;
        row.children().children().first().css("color", valid ? "black" : "red");
        if (!valid) break;
    }
    // Check dropdown
    if ($("#systems option:selected")[0].hasAttribute("hidden")) valid = false;
    // Check axiom
    if ($("#axiom").val().length == 0) valid = false;
    // Check angle
    if ($("#angle").val().length == 0 || isNaN(Number($("#angle").val()))) valid = false;
    return valid;
}

// Called when draw button clicked
function drawSystem() {
    // Make sure data is valid
    if (!validateData()) return;
    // Remove rows with 0% or no input char
    let newData = data.filter(val => val[0] > 0 && val[1].length == 1);
    // Get selected system
    let system = $("#systems option:selected").val();
    // Get axiom
    let axiom = $("#axiom").val();
    // Get angle
    let angle = Number($("#angle").val());
    // Parse data into object
    let rulesObject = {};
    // Add all keys & values to object
    for (let arr of newData) {
        // Get second element (char)
        let input = arr[1];
        // Add percent & output to rulesObject[input]
        if (input in rulesObject) rulesObject[input].push([arr[0], arr[2]]);
        else rulesObject[input] = [
            [arr[0], arr[2]]
        ];
    }
    // Loop through keys
    for (let key in rulesObject) {
        // Sort values
        rulesObject[key].sort((a, b) => b[0] - a[0]);
        // Convert values to percent
        for (let i = 0; i < rulesObject[key].length; i++) {
            rulesObject[key][i][0] /= 100;
            // Add previous percent to work better with random chooser
            if (i > 0) rulesObject[key][i][0] += rulesObject[key][i - 1][0];
        }
    }
    // console.log(system, axiom, angle, iterations, rulesObject);
    // console.log(generateString(axiom, rulesObject, iterations).length);
    push();
    let str = generateString(axiom, rulesObject, iterations);
    coords = generateCoords(str, angle);
    currentIndex = 0;
    color = 0;
    background(0);
    loop();
    pop();
}

let ratio;
let currentIndex;
let color;
function draw() {
    if (frameCount < 3) return;
    push();
    let xSpan = coords[0][2] - coords[0][0];
    let ySpan = coords[0][3] - coords[0][1];
    let ratioX = width / xSpan;
    let ratioY = height / ySpan;
    ratio = min(ratioX, ratioY);
    ratio *= 0.95;
    xSpan *= ratio;
    ySpan *= ratio;
    translate(0, height);
    translate(((width - xSpan) / 2) - (coords[0][0] * ratio), -((height - ySpan) / 2) - (coords[0][3] * ratio));
    noFill();
    colorMode(HSL, 360);
    for (let i = 0; i < max(1, coords[1].length / (drawTime * 30)); i++) {
        // for (let points of coords[1]) {
            color += 360 / coords[1].length;
            stroke(color, 200, 200);
            line(coords[1][currentIndex][0] * ratio, coords[1][currentIndex][1] * ratio, coords[1][currentIndex][2] * ratio, coords[1][currentIndex][3] * ratio);
        // }
        currentIndex++;
        if (currentIndex == coords[1].length) {
            noLoop();
            break;
        }
    }
    pop();
    // currentIndex++;
}

function generateString(axiom, rules, iterations) {
    let str = axiom;
    for (let i = 0; i < iterations; i++) {
        let newStr = "";
        for (let char of str) {
            if (char in rules) {
                if (rules[char].length > 1) {
                    let random = Math.random();
                    for (let rule of rules[char]) {
                        if (random < rule[0]) {
                            newStr += rule[1];
                            break;
                        }
                    }
                } else {
                    newStr += rules[char][0][1];
                }
            } else newStr += char;
        }
        str = newStr;
    }
    return str;
}

function generateCoords(str, angle) {
    angleMode(DEGREES);
    // [x, y, angle]
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;
    let stack = [];
    let currentAngle = 0;
    let pos = [0, 0];
    let coords = [];
    for (let char of str) {
        switch (char) {
            case "F":
                // Move foreward
                let newX = pos[0] + cos(currentAngle);
                let newY = pos[1] + sin(currentAngle);
                if (newX < minX) minX = newX;
                if (newX > maxX) maxX = newX;
                if (newY < minY) minY = newY;
                if (newY > maxY) maxY = newY;
                coords.push(pos.concat([newX, newY]));
                pos = [newX, newY];
                break;
            case "-":
                // Turn left
                currentAngle -= angle;
                break;
            case "+":
                // Turn right
                currentAngle += angle;
                break;
            case "[":
                // Push current position & angle to stack
                stack.push([pos[0], pos[1], currentAngle]);
                break;
            case "]":
                // Restore position & angle from stack
                let prev = stack.pop();
                pos = [prev[0], prev[1]];
                currentAngle = prev[2];
                break;
        }
    }
    return [
        [minX, minY, maxX, maxY], coords
    ];
}
