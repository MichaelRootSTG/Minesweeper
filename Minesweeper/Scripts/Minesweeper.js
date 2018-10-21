(function () {

    var columns = 30,
        rows = 16,
        gameStatus = false,
        remainingMines,
        gameActive = false,
        intervalID,
        boom = false,
        totalMines,
        regex1 = /\/\d+/g, // digits after the /
        regex2 = /\d+\//g; // digits before the /

    document.getElementById("Container").oncontextmenu = function () { return false; }

    $(document).ready(function () {
        $("#date").datepicker();

        var cookie1 = checkCookie("winRate", "0/0");
        var cookie2 = checkCookie("winPercentage", "0%");
        var cookie3 = checkCookie("bestTime", "0");

        if (cookie1 == "" || cookie1 == null)
            $("#WinRate").html("0/0");
        else
            $("#WinRate").html(cookie1);

        if (cookie2 == "" || cookie2 == null)
            $("#WinPercentage").html("0%");
        else
            $("#WinPercentage").html(cookie2);

        if (cookie3 == "" || cookie3 == null)
            $("#BestTime").html("0");
        else
            $("#BestTime").html(cookie3);

        $("#ResetStats").on("click", function () {
            ResetCookies();
        });

    });

    $("#Start").on("click", function () {
        if (!gameStatus) {
            gameStatus = true;
            gameActive = false;
            boom = false;
            $("#GameResult").hide();
            $("#Start").attr("disabled", "true");
            CancelTimer();
            $("span#Time").html("000");
            $("#BoxContainer").empty();
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
                totalMines = data;
                remainingMines = data;
                $("#Remaining").html(totalMines);
                window.setTimeout(allowNextGame, 4000);
            });
        }
    });

    $("#HighScoreDialog").dialog({
        open: function (event, ui) {
            $("#Shield").show();
        },
        close: function (event, ui) {
            $("#Shield").hide();
        },
        dialogClass: "noTitleStuff",
        autoOpen: false,
        height: 145,
        width: 355,
        buttons: [
            {
                text: "Submit",
                click: function () {
                    var highScoreName = $("#HighScoreName").val();
                    if (highScoreName != "" && highScoreName != null) {
                        var time = parseInt($("#Time").html());
                        var url = "Home/AddNewTopTen?score=" + time + "&name=" + highScoreName;
                        $.ajax({
                            url: url,
                            success: function () {
                                $(this).dialog("close");
                            }
                        });
                    }
                }
            }
        ]
    });
    
    function StartTimer() {
        gameActive = true;
        intervalID = setInterval(function () {
            var currentTime = parseInt($("span#Time").html());
            currentTime++;
            if (currentTime < 1000 && $(".boom").length <= 0) {
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
        var allHiddenPositions = [];
        $.getJSON("Home/ShowAllMines", function (data) {
            var len = data.length,
                    i = 0;
            for (; i < len; i++) {
                var test = data[i];
                // If it doesn't have a flag, then show the position of the hidden mine
                if (!$("#Box_Row" + test.YPos + "_Column" + test.XPos).hasClass("flagged")) {
                    $("#Box_Row" + test.YPos + "_Column" + test.XPos).addClass("boom");
                }
                allHiddenPositions.push([test.YPos, test.XPos]);
            }
        })
        .always(function (allHiddenPositions) {
            var flagged = $(".flagged");
            var len = flagged.length,
                i = 0,
                len2 = allHiddenPositions.length;

            for (; i < len; i++) {
                var row = flagged[i].getAttribute("data-row");
                var column = flagged[i].getAttribute("data-column");
                var validFlag = false;
                var i2 = 0;
                for (; i2 < len2; i2++) {
                    // Loop through the mines and see if all our flags match up with one
                    // If we don't find any mine for the flag then it's invalid
                    if (row == allHiddenPositions[i2].YPos && column == allHiddenPositions[i2].XPos) {
                        validFlag = true;
                        break;
                    }
                }
                if (!validFlag) {
                    flagged[i].className = "box bad-flag";
                }
            }
            $(".box").addClass("done");
        });

        var pre = ParseWinRatePre();
        var post = ParseWinRatePost();
        var newWinRate = pre + "/" + (post + 1);
        var newWinPercentage = ((pre / (post + 1)) * 100).toFixed(2) + "%";

        setCookie("winRate", newWinRate, 365);
        setCookie("winPercentage", newWinPercentage, 365);
        $("#WinRate").html(newWinRate);
        $("#WinPercentage").html(newWinPercentage);
    }

    function ParseWinRatePre() {
        var winRate = getCookie("winRate");

        var pre = regex2.exec(winRate);
        if (pre == null) {
            pre = regex2.exec(winRate);
        }

        return parseInt(pre[0].replace("/", ""));
    }

    function ParseWinRatePost() {
        var winRate = getCookie("winRate");

        var post = regex1.exec(winRate);
        if (post == null) {
            post = regex1.exec(winRate);
        }
        var postString = post.toString().replace("/", "");

        return parseInt(postString);
    }

    function CheckLastRow() {
        if ($(".answered-box[data-row='16']").length == 31) {
            $(".answered-box[data-row='16']").css("top", "0px");
        }
    }

    function CheckGameComplete() {
        var answered = $(".answered-box").length;
        var answeredInt = parseInt(answered);

        if (answeredInt + totalMines == 480) {
            CancelTimer();
            gameStatus = false;
            gameActive = false;

            $("#GameResult").show();

            var pre = ParseWinRatePre();
            var post = ParseWinRatePost();
            var newWinRate = (pre + 1) + "/" + (post + 1);

            var newWinPercentage;

            if (post == 0) {
                newWinPercentage = 100 + "%";
            }
            else {
                newWinPercentage = (((pre + 1) / (post + 1)) * 100).toFixed(2) + "%";
            }
            setCookie("winRate", newWinRate, 365);
            setCookie("winPercentage", newWinPercentage, 365);
            $("#WinRate").html(newWinRate);
            $("#WinPercentage").html(newWinPercentage);

            $("#HighScoreDialog").dialog("open");
        }
    }

    function CheckMine() {
        if (!boom && !$(this).hasClass("flagged")) {
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

    function FillContainer() {
        var ci = 0,
            ri = 0;

        for (; ri < rows; ri++) {
            var row = document.createElement("div");
            row.id = "Row" + ri;
            row.className = "row";
            row.style.position = "absolute";
            row.style.top = (40 * ri) + "px";
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
                box.style.position = "absolute";
                box.style.left = (ci * 40) + "px";
                row.appendChild(box);
            }
            ci = 0;
            $("#BoxContainer").append(row);
        }
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function checkCookie(cname, cvalue) {
        var user = getCookie(cname);
        if (user != "") {
            return user;
        }
        else {
            setCookie(cname, cvalue, 365);
        }
    }

    function ResetCookies() {
        var newWinRate = "0/0";
        var newWinPercentage = "0%";
        setCookie("winRate", newWinRate, 365);
        setCookie("winPercentage", newWinPercentage, 365);
        $("#WinRate").html(newWinRate);
        $("#WinPercentage").html(newWinPercentage);
    }

})();