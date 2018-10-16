var columns = 30,
    rows = 16,
    gameStatus = false,
    remainingMines = 99,
    gameActive = false,
    intervalID,
    boom = false;

document.getElementById("Container").oncontextmenu = function () { return false; }

function StartTimer() {
    gameActive = true;
    intervalID = setInterval(function () {
        var currentTime = parseInt($("span#Time").html());
        currentTime++;
        if (currentTime < 1000 && $(".boom").length <= 0 ) {
            if (("" + currentTime).length == 1) {
                var currentTime = "00" + currentTime;
            }
            else if (("" + currentTime).length == 2) {
                var currentTime = "0" + currentTime;
            }
            $("span#Time").html(currentTime);
        }
        else {
            CancelTimer();
        }
    }, 1000);
}

function CancelTimer() {
    clearInterval(intervalID);
}

function Boom() {
    gameActive = false;
    boom = true;
    CancelTimer();
    $.getJSON("Home/ShowAllMines", function (data) {
        var len = data.length,
                i = 0;
        for (; i < len; i++) {
            var test = data[i];
            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("boom");
        }
    });
    $(".box").addClass("done");
}

function CheckLastRow() {
    if ($(".answered-box[data-row='16']").length == 31) {
        $(".answered-box[data-row='16']").css("top", "0px");
    }
}

function CheckGameComplete() {
    var answered = $(".answered-box").length;
    var answeredInt = parseInt(answered);
    var flagged = $(".flagged").length;
    var flaggedInt = parseInt(flagged);

    if (answeredInt + flaggedInt == 480) {
        CancelTimer();
        gameStatus = false;
        gameActive = false;
    }
}

function CheckMine() {
    if (!boom) {
        if (!gameActive)
            StartTimer();

        var url = "Home/Find?row=" + $(this).attr("data-row") + "&column=" + $(this).attr("data-column");
        var element = $(this);

        $.getJSON(url, function (data) {
            element.addClass("clicked");
            if (data == "Boom") {
                element.addClass("boom");
                Boom();
            }
            else {
                var len = data.length,
                    i = 0;
                for (; i < len; i++) {
                    var test = data[i];

                    if ($("#Box_Row" + test.YPos + "_Column" + test.XPos).hasClass("flagged")) {
                        remainingMines--;
                        $("#Box_Row" + test.YPos + "_Column" + test.XPos).removeClass("flagged");
                        $("#Remaining").html("" + remainingMines);
                    }

                    $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("answered-box");
                    CheckLastRow();
                    CheckGameComplete();

                    switch (test.Value) {
                        case 1:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingOne");
                            break;
                        case 2:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingTwo");
                            break;
                        case 3:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingThree");
                            break;
                        case 4:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingFour");
                            break;
                        case 5:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingFive");
                            break;
                        case 6:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingSix");
                            break;
                        case 7:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingSeven");
                            break;
                        case 8:
                            $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("touchingEight");
                            break;
                    }

                    if (test.Value != 0)
                        $("#Box_Row" + test.YPos + "_Column" + test.XPos).html("" + test.Value);
                }
            }
        });
    }
}

function allowNextGame() {
    gameStatus = false;
    $("#Start").removeAttr("disabled");
}

$("#Start").on("click", function () {
    if (!gameStatus) {
        gameStatus = true;
        gameActive = false;
        boom = false;
        $("#Start").attr("disabled", "true");
        CancelTimer();
        remainingMines = 99;
        $("#Remaining").html("" + remainingMines);
        $("span#Time").html("000");
        $("#Container").empty();
        FillContainer();
        $.getJSON("Home/NewGame", function (data) {
            var ci = 0,
            ri = 0;
            for (; ri <= rows; ri++) {
                for (; ci <= columns; ci++) {
                    $("#Box_Row" + ri + "_Column" + ci).delay((ci * 80) + (80 * ri)).animate({ opacity: 1 }, 100);
                }
                ci = 0;
            }
            window.setTimeout(allowNextGame, 4000);
        });
    }
});

function rightClick() {
    if (!$(event.target).hasClass("clicked") && !$(event.target).hasClass("answered-box") && !boom) {
        if ($(event.target).hasClass("flagged")) {
            remainingMines++;
            $(event.target).removeClass("flagged");
            $("#Remaining").html("" + remainingMines);
        }
        else {
            remainingMines--;
            $(event.target).addClass("flagged");
            $("#Remaining").html("" + remainingMines);
        }
    }
}

function FillContainer(){
    var ci = 0,
        ri = 0;

    for (; ri < rows; ri++) {
        var row = document.createElement("div");
        row.id = "Row" + ri;
        row.className = "row";
        if (rows == ri) {
            row.className += " last-row";
        }
        for (; ci < columns; ci++) {
            var box = document.createElement("div",
                {
                    "data-row": ri,
                    "data-column": ci
                });
            box.id = "Box_Row" + ri + "_Column" + ci;
            box.className = "box";
            box.onclick = CheckMine;
            box.dataset.row = ri;
            box.dataset.column = ci;
            box.oncontextmenu = function () { rightClick(); };
            row.appendChild(box);
        }
        ci = 0;
        $("#Container").append(row);
    }
}