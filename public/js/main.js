function isElementInViewport(el)
{
    var rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || doc.documentElement.clientWidth,
    vHeight = window.innerHeight || doc.documentElement.clientHeight,
    efp = function(x, y){ return document.elementFromPoint(x, y) };

    // Return false if it's not in the viewport
    if(rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight)
    {
        return false;
    }

    // Return true if any of its four corners are visible
    return (el.contains(efp(rect.left,  rect.top))
        ||  el.contains(efp(rect.right, rect.top))
        ||  el.contains(efp(rect.right, rect.bottom))
        ||  el.contains(efp(rect.left,  rect.bottom))
    );
}

function isOdd(num)
{
    return num % 2;
}

function getProperty(property)
{
    if(typeof(property) !== "undefined")
    {
        return property;
    }
    else
    {
        return "";
    }
}

function gallery(tile)
{
    $(tile).find('.inner').attr('active','');

    var id = $(tile).attr('data-id');

    $.ajax({
        url: "/getGallery",
        method: "POST",
        data: {
            id: id
        },
        success: function(response){
            if(response.success)
            {
                var slide;

                for(var i = 0; i < response.images.length; i++)
                {
                    $('#slider-for').append('<div class="gallery-slide" style="background-image:url(\'img/portfolio/' + id + '/gallery/' + response.images[i] + '\');"></div>');
                    $('#slider-nav').append('<img src="/img/portfolio/' + id + '/gallery/' + response.images[i] + '" class="nav-slide">');
                }

                $('#slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '#slider-nav'
                });
                
                $('#slider-nav').slick({
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    arrows: false,
                    asNavFor: '#slider-for',
                    centerMode: true,
                    focusOnSelect: true, 
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 4
                            }
                        },
                        {
                            breakpoint: 1000,
                            settings: {
                                slidesToShow: 3
                            }
                        },
                        {
                            breakpoint: 700,
                            settings: {
                                slidesToShow: 2
                            }
                        }
                    ]
                });

                $('#gallery-description').html(response.description);
            }
            else
            {
                alert('An error has occurred while retrieving images');
                console.error(response.error_msgs);
            }
        },
        error: function(response){
            alert('An error has occurred while retrieving images');
            console.error(response);
        }
    });

    $('#gallery').fadeIn(300, 'linear', function(){
        $('body').css('overflow', 'hidden');
    });
}

function closeGallery()
{
    $('#gallery').fadeOut(300, 'linear', function(){
        $('#portfolio .tiles .tile .inner').removeAttr('active');
        $('#slider-for').slick('unslick');
        $('#slider-nav').slick('unslick');
        $('#slider-for').html('');
        $('#slider-nav').html('');
        $('#gallery-description').html('');
        $('body').css('overflow', 'auto');
    });
}

function animateIcons(i, count)
{
    $($('#skills .icon')[i]).addClass('animated fadeInDown');
    
    setTimeout(function(){
        if(i <= count)
        {
            animateIcons(++i, count);
        }
    }, 150);
}

function logVisit()
{
    var parser = new UAParser();

    $.ajax({
        url: "/logVisit",
        method: "POST",
        data: parser.getResult(),
        success: function(response){
            if(!response.success)
            {
                console.error(response.error_msgs);
            }
        },
        error: function(response){
            console.error(response);
        }
    });
}

$(window).on("load resize scroll", function(e){
    $('#cd-timeline .cd-timeline-block').each(function(i, el){
        if(isElementInViewport(el))
        {
            $(el).find('.cd-timeline-content').css('opacity', 1);

            if(i % 2 !== 0 || window.innerWidth < 1170)
            {
                $(el).find('.cd-timeline-content').addClass('animated slideInRight');
            }
            else
            {
                $(el).find('.cd-timeline-content').addClass('animated slideInLeft');
            }
        }
    });

    if(isElementInViewport(document.getElementById('skills')))
    {
        var length = $('#skills .icon').length - 1;

        animateIcons(0, length);
    }

    if(isElementInViewport($('#contact .form-box').get(0)))
    {
        $('#contact .form-box').css('opacity', 1);
        $('#contact .form-box').addClass('animated zoomInDown');
    }
});

$(function(){
    $('.lazy').lazy();

    $('#header .text').fadeIn(1000);

    particlesJS.load('header', 'assets/particles.json', function() {
        setTimeout(function(){
            $('#header .portrait-container').fadeIn(1000);
        }, 700);
    });

    $('[data-scroll]').click(function(){
        var navHeight = 60;
        
        if(window.innerWidth < 700)
        {
            navHeight = 50;
        }

        var scroll = Math.ceil($('#' + this.getAttribute('data-scroll')).position().top - navHeight);

        $('html, body').animate({
            scrollTop: scroll
        }, 700);
    });
    
    $('form[name="contact"]').validate({
        rules: {
            name: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            subject: {
                required: true
            },
            message: {
                required: true
            }
        },
        messages: {
            name: {
                required: "Please enter your name"
            },
            email: {
                required: "Please enter your email",
                email: "Please enter a valid email address"
            },
            subject: {
                required: "Please enter a subject"
            },
            message: {
                required: "Please enter a message"
            }
        },
        submitHandler: function(form){
            $('form[name="contact"] input[type="submit"]').attr('disabled', true);
            $('form[name="contact"] input[type="submit"]').attr('value', 'Sending...');
            
            $.ajax({
                url: "/contact",
                method: "POST",
                data: {
                    name: form.elements['name'].value,
                    email: form.elements['email'].value,
                    subject: form.elements['subject'].value,
                    message: form.elements['message'].value,
                },
                success: function(response){
                    if(response.success)
                    {
                        $('form[name="contact"]').remove();
                        $('.form-message').html('Thanks for your message!');
                    }
                    else
                    {
                        $('form[name="contact"] input[type="submit"]').attr('disabled', false);
                        $('form[name="contact"] input[type="submit"]').attr('value', 'Submit');
                        
                        alert('Your message could not be sent. Please try again later');
                        console.error(response.error_msgs);
                    }
                },
                error: function(response){
                    $('form[name="contact"] input[type="submit"]').attr('disabled', false);
                    $('form[name="contact"] input[type="submit"]').attr('value', 'Submit');
                    
                    alert('Your message could not be sent. Please try again later');
                    console.error(response);
                }
            });
        }
    });

    logVisit();
});

$(document).keyup(function(e){
    //If escpape key is pressed
    if(e.keyCode == 27)
    {
        if($('#gallery').is(":visible"))
        {
            closeGallery();
        }
    }

    //If left arrow key is pressed
    if(e.keyCode == 37)
    {
        if($('#gallery').is(":visible"))
        {
            $('#slider-nav').slick('slickPrev');
        }
    }

    //If right arrow key is pressed
    if(e.keyCode == 39)
    {
        if($('#gallery').is(":visible"))
        {
            $('#slider-nav').slick('slickNext');
        }
    }
});