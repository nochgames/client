function simple_animation(arr,count) {
         function animation(){
            if (tick >= count){
                stop();
                return;
            }
            arr[tick % count].style.display = "block";
            var prev = tick % count - 1;
            if (tick != 0) {
                arr[prev].style.display = "none";
            }
            
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