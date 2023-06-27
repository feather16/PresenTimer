const State = {
    none: 0,
    started: 1,
    stopped: 2,
}

function zeroPadding(num, length){
	return (Array(length).join('0') + num).slice(-length);
}

function formatMSTime(ms) {
    let minutes = Math.floor(ms / (60 * 1000));
    let seconds = Math.floor((ms % (60 * 1000)) / 1000);
    let milliseconds = Math.floor(ms % 1000);

    return (
        zeroPadding(minutes, 2) +
        ":" +
        zeroPadding(seconds, 2) +
        "." +
        zeroPadding(milliseconds, 3).substring(0, 2)
    );
}

function formatMSTimeForPaste(ms){
    let sec = Math.floor(ms / 1000 + 0.5);
    let minutes = Math.floor(sec / 60);
    let seconds = Math.floor(sec % 60);

    return (
        zeroPadding(minutes, 2) +
        ":" +
        zeroPadding(seconds, 2)
    );
}

let state = State.none;
let stoppedTime = 0.0;
let startedTime = 0.0;
let lapTimes = [];

function updateTimer(){
    if(state == State.started){
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startedTime + stoppedTime;
        $("#timer").text(formatMSTime(elapsedTime));
    }
}

function buttonDisabler(){
    $("#lapButton").prop("disabled", state != State.started);
    $("#clearButton").prop("disabled", state == State.none);
    $("#copyButton").prop("disabled", lapTimes.length == 0);
}

function unloadCheck(){
    if(state == State.none){
        window.onbeforeunload = null;
    }
    else{
        window.onbeforeunload = function(e){
            e.returnValue = "ページを離れようとしています。よろしいですか？";
        };
    }
}

$("#startButton").click(function(){
    if(state == State.none){
        startedTime = new Date().getTime();
        state = State.started;
        $(this).text("一時停止");
    }
    else if(state == State.started){
        state = State.stopped;
        const currentTime = new Date().getTime();
        stoppedTime += currentTime - startedTime;
        $(this).text("スタート");
    }
    else if(state == State.stopped){
        startedTime = new Date().getTime();
        state = State.started;
        $(this).text("一時停止");
    }
});

$("#lapButton").click(function(){
    if(state == State.started){
        const currentTime = new Date().getTime();
        const lapTime = currentTime - startedTime + stoppedTime;
        const lapTimeDiff = lapTimes.length == 0 ? lapTime : (lapTime - lapTimes[lapTimes.length - 1]);
        $("#lapTimes").append(
            "<p>" + 
            '#' + zeroPadding(lapTimes.length + 1, 2) + "&nbsp;&nbsp;&nbsp;" +
            formatMSTime(lapTimeDiff) + "&nbsp;&nbsp;&nbsp;" +
            formatMSTime(lapTime) +
            "</p>"
        );
        lapTimes.push(lapTime);
    }
});

$("#clearButton").click(function(){
    if(state != State.none){
        if(confirm("本当にクリアしますか？")){
            state = State.none;
            stoppedTime = 0.0;
            startedTime = 0.0;
            lapTimes = []
            $("#timer").text("00:00:00");
            $("#lapTimes").empty();
            $("#startButton").text("スタート");
        }
    }
});

$("#copyButton").click(function(){
    if (lapTimes.length > 0){

        // 各ラップの時間を取得
        let lapTimeDiffs = [lapTimes[0]];
        for(let i = 1; i < lapTimes.length; i++){
            lapTimeDiffs.push(lapTimes[i] - lapTimes[i - 1]);
        }

        let copiedText = "Total: " + formatMSTimeForPaste(lapTimes[lapTimes.length - 1]);
        for(let i = 0; i < lapTimes.length; i++){
            copiedText += (
                "\nP" + zeroPadding(i + 1, 2) + " " + 
                formatMSTimeForPaste(lapTimeDiffs[i]) + " " +
                formatMSTimeForPaste(lapTimes[i])
            );
        }
        navigator.clipboard.writeText(copiedText).then(function() {
            alert("ラップタイムがコピーされました");
        });
    }
});

$(document).ready(function(){
    setInterval(updateTimer, 10);
    setInterval(buttonDisabler, 20);
    setInterval(unloadCheck, 20);
})