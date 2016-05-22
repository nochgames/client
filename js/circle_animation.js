var CircleAnimation = function(arr,count){
        this.tick = 0;
        this.animate = false;
        this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
        this.requestId;
        this.arr = arr; 
        this.count = count;

};
CircleAnimation.prototype = {
        animation: function(self) {
            if (!this.animate){
                return; 
             }
            this.arr[this.tick % this.count].style.display = "block";
            var prev = this.tick % this.count - 1;
            if (this.tick % this.count == 0) prev = this.count - 1;
            this.arr[prev].style.display = "none";
            this.tick++;
            requestAnimationFrame(this.animation.bind(this));
            
        },
        start: function(){ 
            this.animate = !this.animate;
            this.requestId = requestAnimationFrame(this.animation.bind(this));

        },
        stop: function(){
            cancelAnimationFrame(this.requestId);
            this.animate = !this.animate;
            for (var i = 0; i<this.count;i++){
                this.arr[i].style.display = 'none';
            }
           
        }

};
