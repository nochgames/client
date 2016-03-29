function hover_animation(arr,count) {
         function animation(){
            arr[tick % 100].style.display = "block";
            var prev = tick % 100 - 1;
            if (tick % 100 == 0) prev = 99;
            arr[prev].style.display = "none";
            tick++;
            if (!animate){
               return; 
            }
            requestAnimationFrame(animation);
            
        }
        function handlerIn(){ 
            animate = !animate;
            requestId = requestAnimationFrame(animation);
            //Game.addCallback('button', animation);

        }
        function handlerOut(){
            var prev = tick % 100 - 1;
            if (tick % 100 == 0) prev = 99;
            arr[tick % 100].style.display = "none";
            arr[tick % 100-1].style.display = "none";
            arr[0].style.display = "block";
            arr[prev].style.display = "none";
            cancelAnimationFrame(requestId);
            //Game.removeCallback('button');
            tick = 0;
            animate = !animate;
            $("#garage").attr("src","garage/(1).png");
            $("#try_more").hide(200);
           
        }
        ///
        var tick = 0,animate = false;
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
        var requestId;
        $("#garage_ref").hover( handlerIn, handlerOut );
        
}