const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const context = canvas.getContext('2d');

let keys = [];

const 
    canvas_width  = 800,
    canvas_height = 600, 
    ground_height = 35, 
    player_width  = 20, 
    player_height = 30;

const player = {
    x: 10,
    y: canvas_height - ground_height - player_height,
    old_x: 0,
    old_y: 0,
    falling: false,
    jump: false,
    landing: false,
    jumping_value: 0,
    jumping_frames: 15,
    colidding: {
        left: false,
        right: false,
        top: false,
        bottom: false
    },
    color: "red"
};

const game = {
    player: player,
    objs: []
};

const objects_count = Math.floor(Math.random() * 5);
for (let i = 0; i < objects_count; i++) {
    const random_x = Math.floor(Math.random() * canvas_width - 25); // - w
    const random_y = Math.floor(Math.random() * canvas_height - 10); // - h

    if (!(random_x + 25 > player.x && random_x < player.x + player_width)) {
        game.objs.push({
            x: random_x,
            y: canvas_height - ground_height - 10, // - h
            w: 25,
            h: 10
        });
    }
}

console.log(game.objs)

document.addEventListener("keydown", (event) => {
    if (!keys.includes(event.key)) {
        keys.push(event.key);
    }
});

document.addEventListener("keyup", (event) => {
    keys = keys.filter((a) => a !== event.key);
});

const move_player = () => {

    if (keys.includes("a") && player.x > 0 && !player.colidding.left) {
        player.x -= 5;
    } 

    if (keys.includes("d") && player.x < canvas_width - player_width && !player.colidding.right) {
        player.x += 5;
    }

    // força o player a voltar para o chao caso nao esteja pulando e nem colidindo com nada abaixo
    if (!player.jump && !player.colidding.bottom) {
        if (player.y < canvas_height - ground_height - player_height) {
            player.y++;
        }       
    }

    // evita o player entrar dentro de objetos
    if (player.y > canvas_height - ground_height - player_height) {
        player.y = canvas_height - ground_height - player_height;
    }

    if (keys.includes(" ") && !player.jump && player.y >= canvas_height - ground_height - player_height) {

        player.old_x = player.x;
        player.old_y = player.y;
        
        const jumping_interval = setInterval(() => {

            player.y = player.old_y - player.jumping_value;

            if (player.jumping_value == 15) {
                player.landing = true;
            }

            if (!player.landing) {
                player.jumping_value++;
            }

            if (player.landing) {

                player.jumping_frames--;

                if (player.jumping_frames == 0) {

                    player.jumping_frames--;

                    if (player.jumping_frames < 0) {
                        player.jumping_frames = 0;
                    }

                    player.y = player.old_y - player.jumping_frames;
                }

                if (player.jumping_value == 0 || !player.colidding.bottom) {

                    player.jumping_frames = 15;
                    player.jumping_value = 0;

                    player.jump = false;
                    player.landing = false;

                    clearInterval(jumping_interval);
                }
            }      

        }, 1000 / 60);

        player.jump = true;
    }
};

const draw_player = () => {

    if (!context) {
        return;
    }

    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player_width, player_height);
};

const draw_obstaculo = () => {
    
    if (!context) {
        return;
    }

    for (let i = 0; i < game.objs.length; i++) {
            
        context.fillStyle = "yellow";
        context.fillRect(game.objs[i].x, game.objs[i].y, game.objs[i].w, game.objs[i].h);
    }
};

const detect_collision = () => {

    for (let i = 0; i < game.objs.length; i++) {

        const player_points = {
            p1: {
                x: player.x,
                y: player.y
            },
            p2: {
                x: player_width + player.x,
                y: player.y
            },
            p3: {
                x: player.x,
                y: player.y + player_height
            },
            p4: {
                x: player_width + player.x,
                y: player.y + player_height
            }
        };

        player.colidding.right = false;
        player.colidding.left = false;
        player.colidding.bottom = false;
        player.colidding.top = false;

        if ( // right
            player_points.p2.x >= game.objs[i].x && 
            player_points.p2.x <= game.objs[i].x + game.objs[i].w && 
            player.y + player_height > game.objs[i].y
        ){
            player.colidding.right = true;
        }


        if ( // left
            player_points.p1.x <= game.objs[i].x + game.objs[i].w && 
            player_points.p1.x >= game.objs[i].x + game.objs[i].w && 
            player.y + player_height > game.objs[i].y
        ){
            player.colidding.left = true;
        }

        if ( // bottom
            player.y + player_height >= game.objs[i].y &&
            player.y <= game.objs[i].y + game.objs[i].h &&
            player.x + player_width >= game.objs[i].x &&
            player.x <= game.objs[i].x + game.objs[i].w
        ){
            player.colidding.bottom = true; 
        }

        if ( // top
            player.y + player_height <= game.objs[i].y &&
            player.y >= game.objs[i].y + game.objs[i].h &&
            player.x + player_width >= game.objs[i].x &&
            player.x <= game.objs[i].x + game.objs[i].w
        ){
            player.colidding.top = true; 
        }
    }
};

const render_world = () => {

    const img = new Image();
    img.src = "bg.png";

    img.onload = context.drawImage(img, 0, 0);

    context.fillStyle = "green";
    context.fillRect(0, canvas_height - ground_height, canvas_width, ground_height);
};

const setup = () => {
    render_world();
    move_player();
    draw_obstaculo();
    detect_collision();
    draw_player();
};

const interval = setInterval(() => {

    // limpa o canvas
    context.clearRect(0, 0, canvas_width, canvas_height);

    setup();
    
}, 1000 / 60);