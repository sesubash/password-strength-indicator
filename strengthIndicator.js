/*
* Author      : Subash Selvaraj
* Version     : 1.0
* Created date: 14-07-2016
*/

/*

Score calcuation logic
Score = 0 if

Less than 8 chars
Doesn’t contain at least one number
If pwd=email


Score calculation
score = score + ([pwd length]*4)

score = score + ([# of repetitive characters 1 character apart] - [pwd length])
score = score + ([# of repetitive characters 2 characters apart] - [pwd length])
score = score + ([# of repetitive characters 3 characters apart] - [pwd length])
score = score + ([# of repetitive characters 4 characters apart] - [pwd length])

if pwd has at least 3 digits then score = score + 5
if pwd has at least 2 symbols then score = score + 5
if pwd has Upper and lower chars then score = score + 15
if pwd has number and chars then score = score + 15
if pwd has a number and a symbol then score = score + 15
if pwd has a char and a symbol then score = score + 15

if score >100 then score = 100


Score interpretation
Score = 0  - unacceptable
Score < 34  - weak
Score >34 and < 68 - good
Score > 68 – strong

Visualization



Visualization has 9 segments

1)  Score = zero
a.  One segment filled in red EE3123
b.  Word after colon “Unacceptable”
c.  “Unacceptable” in red

2)  Score = 1-34
a.  3 segments filled in red EE3123
b.  Word after colon “Weak”
c.  “Weak” in red

3)  Score = 35-45
a.  4 segments filled in orange EA8D1A
b.  Word after colon “Fair”
c.  “Fair” in Orange

4)  Score = 46-56
a.  5 segments filled in yellow FFDD200
b.  Word after colon “Fair”
c.  “Fair” in Yellow


5)  Score = 57- 68
a.  6 segments filled in yellow FFDD200
b.  Word after colon “Good”
c.  “Good” in Yellow

6)  Score = 69-79
a.  7 segments filled in green 53B947
b.  Word after colon “Good”
c.  “Good” in Green

7)  Score = 80-90
a.  8 segments filled in green 53B947
b.  Word after colon “Strong”
c.  “Strong” in Green

8)  Score = 91-100
a.  9 segments filled in red 15620D
b.  Word after colon “Strong”
c.  “Strong” in Green

*/

(function ($) {
    

    $.fn.strengthIndicator = function(options){
        var strengthIndicator = this;
        var score = 0;
        var defaults = {
        };
        strengthIndicator.settings = $.extend({}, defaults, options);

        strengthIndicator.destroy = function(){
            strengthIndicator.each(function(){
                $.removeData(this);
            });
        };

        return strengthIndicator.each(function(i){
            var obj = $(this);

            var $input = $(strengthIndicator.settings.input);


            //setup before functions
            var typingTimer;                //timer identifier
            var doneTypingInterval = 100;  //time in ms, 5 second for example

            //on keyup, start the countdown
            $input.on('keyup', function () {
              clearTimeout(typingTimer);
              typingTimer = setTimeout(doneTyping, doneTypingInterval);
            });

            //on keydown, clear the countdown 
            $input.on('keydown', function () {
              clearTimeout(typingTimer);
            });

            //user is "finished typing," do something
            function doneTyping () {
                calculateScore($input.val());
                updateView();
            }

            function calculateScore(value){
                score = 0;
                var numberLength = value.replace(/[^0-9]/g,"").length;
                var alphaLength = value.replace(/[^a-zA-Z]/g,"").length;
                var length = value.length;

                if((length < 8) || !numberLength || !alphaLength || value == strengthIndicator.settings.email){
                    return;
                }

                // Check for valid symbols
                if(!(/^[a-zA-Z0-9!@#$%\^&+=?*]*$/).test(value)){
                    return;
                }


                score = length * 4;


                var uniqueStr = value.split('').filter(function(v,i,self){
                                  return self.indexOf(v) == i;
                                }).join('');

                var uniqueLen = uniqueStr.length;

                var one_apart = 0, two_apart = 0, three_apart = 0, four_apart = 0;
                var diffSymbols = ["$","^","*","(",")","+","[","]","|","\\","?"];
                for(var i=0; i<uniqueLen; i++){
                    var char = uniqueStr.charAt(i);

                    var regChar = (diffSymbols.indexOf(char) > 0) ? "\\"+char : char; // adjust ^ character as it behaves differently at 0th index
                    var regex = new RegExp(regChar, 'g');
                    while ((match = regex.exec(value.substr(value.indexOf(char), length))) != null) {
                        if(match.index){
                            (match.index == 2) ? one_apart ++ : '';
                            (match.index == 3) ? two_apart ++ : '';
                            (match.index == 4) ? three_apart ++ : '';
                            (match.index == 5) ? four_apart ++ : '';
                        }

                        // avoid an infinite loop on zero-length matches
                        // Reference 1: http://www.regexguru.com/2008/04/watch-out-for-zero-length-matches/
                        // Reference 2: http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
                        if (regex.lastIndex == match.index) {
                            regex.lastIndex++;
                        }
                    }
                }

                if(one_apart)
                    score += (one_apart - length);
                if(two_apart)
                    score += (two_apart - length);
                if(three_apart)
                    score += (three_apart - length);
                if(four_apart)
                    score += (four_apart - length);


                var symbolLength =  value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/gi) ?
                                    value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/gi).length :
                                    0;

                // if contains atleast 3 digits
                score += (numberLength >= 3) ? 5 : 0;
                // if contains atleast 2 symbols
                score += ( symbolLength >= 2) ? 5 : 0;
                // if contains uppercase and lowercase characters
                score += (/[a-z][A-Z]/.test(value)) ? 15 : 0;
                // if contains numbers and characters
                score += (/[0-9]/.test(value) && /[a-z A-Z]/.test(value)) ? 15 : 0;
                // if contains numbers and symbols
                score += (/[0-9]/.test(value) && symbolLength) ? 15 : 0;
                // if contains characters and symbols
                score += (/[a-z A-Z]/.test(value) && symbolLength) ? 15 : 0;

                score = (score > 100) ? 100 : score;
            }

            function updateView(){

                obj.find(".score").removeClass (function (index, css) {
                    var match = css.match(/\w*\S\w*-fill+/g);
                    return match ? match.join(" ") : "";
                });

                                                                var status = '';
                if(score == 0){
                    obj.find(".invalid").addClass("invalid-fill");
                    status = "Unacceptable";
                }else if(score >= 1 && score <= 34){
                    obj.find(".weak").addClass("weak-fill");
                    status = "Weak";
                }else if(score >= 35 && score <= 45){
                    obj.find(".less-fair").addClass("less-fair-fill");
                    status = "Fair";
                }else if(score >= 46 && score <= 56){
                    obj.find(".fair").addClass("fair-fill");
                    status = "Fair";
                }else if(score >= 57 && score <= 68){
                    obj.find(".less-good").addClass("less-good-fill");
                    status = "Good";
                }else if(score >= 69 && score <= 79){
                    obj.find(".good").addClass("good-fill");
                    status = "Good";
                }else if(score >= 80 && score <= 90){
                    obj.find(".less-strong").addClass("less-strong-fill");
                    status = "Strong";
                }else if(score >= 91 && score <= 100){
                    obj.find(".strong").addClass("strong-fill");
                    status = "Strong";

                }

                obj.find(".status").text(status);

                // update score attr
                $input.attr("data-score", score);
                // mimic to force validation plugin to work
                if($.validator){
                    $input.valid();
                }

                strengthIndicator.settings.onComplete(status);
            }


        });
    };
})(jQuery);
