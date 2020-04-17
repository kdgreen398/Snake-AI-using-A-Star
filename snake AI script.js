var grid = document.getElementById("grid");
var node_array = [];
var start_node = null;
var end_node = null;

var blank_color = "#1982C4";
var food_color = "#FF595E";
var snake_color = "#FFCA3A";



var running;

var speed = 50; // lower values means the animation runs faster

var snake = {
    row: 12,
    column: 25,
    direction: "up",
    tail: [],
    instructions: [],
    show(){
        for (var i = this.tail.length-1; i >=0; i--){
            this.tail[i].show();
        }
        this.move();
        node_array[this.row][this.column].state = "head";
        node_array[this.row][this.column].element.style.backgroundColor = "#00FF00";

    },
    move(){
        if (this.instructions.length != 0){

            var offsets = this.instructions.pop();
            this.row += offsets[0];
            this.column += offsets[1];

            if (this.row == food.row && this.column == food.column){
                while(true){
                    food.row = Math.floor(Math.random() * 25);
                    food.column = Math.floor(Math.random() * 50);

                    if(node_array[food.row][food.column].state != "wall")
                        break;
                }
                this.tail.push(new Tail(this.tail.length));

                start_node = node_array[snake.row][snake.column];
                end_node = node_array[food.row][food.column];

                runAStar();
            }
        }
    }
};

var food = {
    row: 15,
    column: 23,
    show(){
        node_array[this.row][this.column].state = "food";
        node_array[this.row][this.column].element.style.backgroundColor = food_color;
    }
};

function Tail(index){
    this.row;
    this.column;
    this.index = index;

    this.show = function() {
        if (this.index == 0){
            this.row = snake.row;
            this.column = snake.column;
        }
        else {
            this.row = snake.tail[this.index-1].row;
            this.column = snake.tail[this.index-1].column;
        }

        
        node_array[this.row][this.column].state = "wall";
        node_array[this.row][this.column].element.style.backgroundColor = snake_color;
    };
}

function Node(row, column, element){
    this.row = row;
    this.column = column;
    this.element = element;
    this.state = "blank";

    this.distance_to_end = null;
    this.distance_from_start = null;
    this.f_cost = null;
    this.previous_node = null;
}

function setup(){
    for(var i = 0; i < 25; i++){
        var node_row = [];
        for (var j = 0; j < 50; j++){
            var node = document.createElement("div");
            node.className = "node";
            node.id = i+'-'+j;
            grid.appendChild(node);
            node_row.push(new Node(i, j, node));
        }
        node_array.push(node_row);
    } 
    snake.show();
    food.show();

    start_node = node_array[snake.row][snake.column];
    end_node = node_array[food.row][food.column];
    
    resizeGrid();
    runAStar();
}

setup();


function start(){
    running = setInterval(updateGrid, speed);
}

function updateGrid(){
    resetGrid();
    snake.show();

    food.show();
    
}

function restart(){
    clearInterval(running);
    resetGrid();

    snake.row = Math.floor(Math.random() * 25);
    snake.column = Math.floor(Math.random() * 50);
    snake.tail = [];
    snake.instructions = [];
    food.row = Math.floor(Math.random() * 25);
    food.column = Math.floor(Math.random() * 50);
    snake.show();
    food.show();

    start_node = node_array[snake.row][snake.column];
    end_node = node_array[food.row][food.column];
    runAStar();

}

function resetGrid(){
    for(var i = 0; i < 25; i++){
        for(var j = 0; j < 50; j++){
            node_array[i][j].state = "blank";
            node_array[i][j].element.style.backgroundColor = blank_color;
            node_array[i][j].distance_from_start = null;
            node_array[i][j].distance_to_end = null;
            node_array[i][j].f_cost = null;
            node_array[i][j].previous_node = null;

            start_node = null;
            end_node = null;
        }
    }
}

function runAStar(){
    if (start_node == null || end_node == null)
        return;

    var open_list = [];
    var closed_list = [];

    open_list.push(start_node);
    var current_node = start_node;

    current_node.distance_from_start = 0;
    current_node.distance_to_end = Math.abs(current_node.row - end_node.row) + Math.abs(current_node.column - end_node.column);
    current_node.f_cost = current_node.distance_from_start + current_node.distance_to_end;

    while(current_node != end_node){
        getAdjNodes(current_node).forEach(function(item){
            if(!closed_list.includes(item) && !open_list.includes(item)){
                item.distance_from_start = current_node.distance_from_start + getDistance(item, current_node);
                item.distance_to_end = Math.abs(item.row - end_node.row) + Math.abs(item.column - end_node.column);

                if(item.f_cost == null){
                    item.f_cost = item.distance_from_start + item.distance_to_end;
                    item.previous_node = current_node;
                }
                else{
                    var newFCost = item.distance_from_start + item.distance_to_end;
                    if(newFCost < item.f_cost){
                        item.f_cost = newFCost;
                        item.previous_node = current_node;
                    }
                }
                open_list.push(item);
            }
        });

        open_list.splice(open_list.indexOf(current_node), 1);
        closed_list.push(current_node);

        if(open_list.length == 0) // no path found
            return;
            
        var lowest_f = open_list[0].f_cost;
        current_node = open_list[0];

        open_list.forEach(function(item) {
            if(item.f_cost < lowest_f){
                lowest_f = item.f_cost;
                current_node = item;
            }
        });
    }
    // console.log("path found!");
    retracePath(current_node);
}

function getDistance(obj_1, obj_2){
    var a = Math.abs(obj_1.row - obj_2.row);
    var b = Math.abs(obj_1.column - obj_2.column);
    var c = Math.sqrt(Math.pow(a, 2) +  Math.pow(b, 2));

    return c;
}

function getAdjNodes(node){
    var adj_nodes = [];

    if (node.row != node_array.length - 1)
    {
        var adj = node_array[node.row + 1][node.column];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.column != node_array[0].length - 1)
    {
        var adj = node_array[node.row][node.column + 1];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.row != 0)
    {
        var adj = node_array[node.row - 1][node.column];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.column != 0)
    {
        var adj = node_array[node.row][node.column - 1];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    return adj_nodes;

}
function retracePath(node){
    if(node == start_node){

        return;
    }
    else {
        
        var y_offset = node.row - node.previous_node.row;
        var x_offset = node.column - node.previous_node.column;
        
        snake.instructions.push([y_offset, x_offset]);
        
        retracePath(node.previous_node);
        
        if(node != end_node){
            node.state = "path";
            node.element.style.backgroundColor = "black";
        }
    }
}


function resizeGrid(){
    if(window.outerWidth < 1250){
        grid.style.width = window.outerWidth + "px";
        grid.style.height = "auto";
        grid.style.marginBottom = "15px";
        for(var i = 0; i < node_array.length; i++){
            for(var j = 0; j < node_array[i].length; j++){
                node_array[i][j].element.style.width = window.outerWidth/50 + "px";
                node_array[i][j].element.style.height = window.outerWidth/50 + "px";
            }
        }
    }
    else {
        grid.style.width = "1250px";
        grid.style.geight = "625px";
        for(var i = 0; i < node_array.length; i++){
            for(var j = 0; j < node_array[i].length; j++){
                node_array[i][j].element.style.width = "25px";
                node_array[i][j].element.style.height = "25px";
            }
        }
    }
}