(function($) {
    $.fn.stacktack = function(opts) {
        var options = $.extend($.fn.stacktack.defaults, opts);
        
        if (options.stylesheet)
        {
            // only include the stylesheet once
            if ($('link[href=' + options.stylesheet + ']').length === 0)
            {
                // necessary for IE to dynamically load stylesheet
                if (document.createStyleSheet)
                {
                    document.createStyleSheet('stacktack.css');
                }
                else
                {
                    $('<link rel="stylesheet" type="text/css" href="' + options.stylesheet + '" />').appendTo('head'); 
                }
            }
        }
        
        function createProfile(user)
        {
            return '<div class="stacktack-profile"><img src="http://www.gravatar.com/avatar/' + user.email_hash + '?d=identicon&s=32" class="stacktack-gravatar" /><a href="http://www.' + options.site + '/users/' + user.user_id  + '" target="_blank">' + user.display_name + '</a><br/>' + user.reputation + '</div>';
        }
        
        return this.each(function() {
            var $this = $(this);
            $this.filter('[id^=stacktack]').add($this.find('[id^=stacktack]')).each(function(index, value) {
                var item = $(value);
                var questionId = /\d+$/.exec(value.id);

                $.ajax({
                    dataType: 'jsonp',
                    data: {
                        'type': 'jsontext',
                        'apikey':'kz4oNmbazUGoJIUyUbSaLg',
                        'body': 'true'
                    },
                    url: 'http://api.' + options.site + '/' + options.apiVersion + '/questions/' + questionId[0] + '?jsonp=?',
                    success: function(data) {
                        var question = data.questions[0];

                        // appended as last step
                        var containerElement = $('<div class="stacktack-container"></div>');
                        
                        var contentElement = $('<div class="stacktack-content"><a href="http://www.stacktack.com/" target="_blank" title="StackTack"><img src="logo.png" alt="StackTack" title="StackTack" class="stacktack-logo" /></a></div>');
                        containerElement.append(contentElement);

                        var questionElement = $('<div class="stacktack-question"> <div class="stacktack-question-header clearfix">' + createProfile(question.owner) + '<h3><a href="http://www.' + options.site + '/questions/' + question.question_id + '" target="_blank">' + question.title + '</a></h3><div class="stacktack-votes">' + question.score + ' Votes</div></div><div class="stacktack-question-body">' + question.body + '</div></div>');
                        contentElement.append(questionElement);

                        if (options.showTags)
                        {
                            var tagsElement = $('<ul class="stacktack-tags"></ul>');
                            for (var i = 0; i < question.tags.length; i++)
                            {
                                var tagElement = $('<li>' + question.tags[i] + '</li>');
                                tagsElement.append(tagElement);
                            }
                            questionElement.append(tagsElement);
                        }

                        var answersElement = $('<div class="stacktack-answers"></div>');
                        contentElement.append(answersElement);

                        // filter the answers
                        var visibleAnswers = [];
                        if (question.answers.length > 0)
                        {
                            if (options.onlyShowAcceptedAnswer)
                            {
                                for (var i = 0; i < question.answers.length; i++)
                                {
                                    if (question.answers[i].accepted)
                                    {
                                        visibleAnswers.push(i);
                                    }
                                }
                            }
                            else if (options.filterAnswers.length > 0)
                            {
                                for (var i = 0; i < question.answers.length; i++)
                                {
                                    if ($.inArray(question.answers[i].answer_id, options.filterAnswers) > -1)
                                    {
                                        visibleAnswers.push(i);
                                    }
                                }
                            }
                            else if (options.answerLimit > 0)
                            {
                                for (var i = 0; i < options.answerLimit; i++)
                                {
                                    visibleAnswers.push(i);
                                }
                            }
                        }

                        // render the answers
                        for (var i = 0; i < question.answers.length; i++)
                        {
                            var answer = question.answers[i];
                            
                            var answerElement = $('<div class="stacktack-answer"><div class="stacktack-answer-header clearfix">' + createProfile(answer.owner) + '<h4><a href="http://www.' + options.site + '/questions/' + question.question_id + '#' + answer.answer_id + '" target="_blank">Answer ' + (i + 1) + '</a></h4><div class="stacktack-votes">' + answer.score + ' Votes</div></div><div class="stacktack-answer-body">' + answer.body + '</div></div>');
                            if (answer.accepted)
                            {
                                answerElement.addClass('stacktack-answer-accepted');
                                answerElement.find('.stacktack-answer-header h4').prepend('<img src="check.png" alt="Accepted" title="Accepted" class="stacktack-answer-check" />');
                                answerElement.find('.stacktack-votes').append(' | Accepted');
                            }
                            // hide answer if it isn't in the visible list
                            if ($.inArray(i, visibleAnswers) == -1)
                            {
                                answerElement.hide();
                            }
                            answersElement.append(answerElement);
                        }
                        
                        // make all links open in a new window
                        containerElement.find('a').attr('target', '_blank');
                        
                        // render "more answers" button if the answers were filtered at all
                        if (visibleAnswers.length > 0)
                        {
                            var moreElement = $('<a href="#" class="stacktack-answers-more">+ More Answers</a>"');
                            moreElement.click(function() {
                                $(this).hide();
                                answersElement.find('.stacktack-answer:hidden').slideDown('fast');
                                return false;
                            });
                            answersElement.append(moreElement);
                        }
                        
                        item.append(containerElement);
                    }
                });
            });
        });
    };

    $.fn.stacktack.defaults = {
        site: 'stackoverflow.com',
        apiVersion: 0.8,
        stylesheet: 'stacktack.css',
        answerLimit: 0,
        onlyShowAcceptedAnswer: false,
        filterAnswers: [],
        showTags: true
    };

})(jQuery);