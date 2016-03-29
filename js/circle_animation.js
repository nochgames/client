function circle_animation(arr,count) {
         function animation(){
            arr[tick % count].style.display = "block";
            var prev = tick % count - 1;
            if (tick % count == 0) prev = count - 1;
            arr[prev].style.display = "none";
            tick++;
            if (!animate){
               return; 
            }
            requestAnimationFrame(animation);
            
        }
        function start(){ 
            animate = !animate;
            requestId = requestAnimationFrame(animation);
            //Game.addCallback('button', animation);

        }
        function stop(){
            var prev = tick % count - 1;
            if (tick % count == 0) prev = count - 1;
            arr[tick % count].style.display = "none";
            arr[tick % count-1].style.display = "none";
            arr[0].style.display = "block";
            arr[prev].style.display = "none";
            cancelAnimationFrame(requestId);
            //Game.removeCallback('button');
            tick = 0;
            animate = !animate;
           
        }
        ///
        var tick = 0,animate = false;
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
        var requestId;
        start();
        
}