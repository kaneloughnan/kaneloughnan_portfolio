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

function gallery(tile)
{
    $(tile).find('.inner').attr('active','');

    var title = $(tile).find('span').html();
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
                var link;

                for(var i = 0; i < response.images.length; i++)
                {
                    link = '<a class="gallery-link" href="/images/portfolio/' + id + '/gallery/' + response.images[i] + '">' + 
                        '<figure class="gallery-image">' + 
                            '<img src="/images/portfolio/' + id + '/gallery/' + response.images[i] + '">' + 
                            '<figcaption>' + title + '</figcaption>' + 
                        '</figure>' + 
                    '</a>';

                    $('#magnific .gallery').append(link);
                }
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

    $('#magnific').fadeIn(300, 'linear', function(){
        $('body').css('overflow', 'hidden');
    });
}

function closeGallery()
{
    $('#magnific').fadeOut(300, 'linear', function(){
        $('#portfolio .tiles .tile .inner').removeAttr('active');
        $('#magnific .gallery').html('');
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
        $('#contact .form-box').addClass('animated fadeInDown');
    }
});

$(function(){
    $('.gallery-link').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: false,
        mainClass: 'mfp-with-zoom mfp-img-mobile',
        image: {
            verticalFit: true,
            titleSrc: function (item) {
                return item.el.find('figcaption').text() || item.el.attr('title');
            } 
        },
        zoom: {
            enabled: true 
        },
        // duration: 300
        gallery: {
            enabled: true,
            navigateByImgClick: false,
            tCounter: '' 
        },
        disableOn: function () {
            return $(window).width() > 640;
        }
    });

    $('#header .title').css('opacity', 1);
    $('#header .title').addClass('animated flash');

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
        if($('#magnific').is(":visible"))
        {
            closeGallery();
        }
    }
});