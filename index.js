const mysql = require('mysql2')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });

const app = express()
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vic.24141996',
    database: 'jogador'
});

connection.connect(function (err) {
    if (err) {
        console.error('Erro: ', err)
        return
    }
    console.log("Conexão estabelecida com sucesso!")
});

app.get("/cadastro", function (req, res) {
    res.sendFile(__dirname + "/cadastro.html")
})

app.post('/adicionar', upload.single('imagem'), (req, res) => {
    if (!req.file) {
        console.log("Nenhum aequivo enviado.")
        req.status(400).send("Nenhum arquivo Enviado.")
        return;
    }
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    const nick = req.body.nick;
    const bio = req.body.bio;
    const cidade = req.body.cidade;
    const estado = req.body.estado;
    const imagem = req.file.filename;
    const values = [usuario, senha, nick, bio, cidade, estado, imagem]
    const insert = "INSERT INTO usuarios(usuario, senha, nick, bio, cidade, estado, imagem ) VALUES (?,?,?,?,?,?,?)"

    connection.query(insert, values, function (err, result) {
        if (!err) {
            console.log("Dados inseridos com sucesso!");
            res.send(`
            
            <!DOCTYPE html>
            <html lang="pt-br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>START</title>
                <link rel="icon" type="image/x-icon" href="icon.png">
                <link rel="stylesheet" type="text/css" href="/estilo.css">
            </head>
            <body class="site">
                <div class="bg1">
                    <h1></h1>
                </div>
                <div class="site-content bg2">
                    <p>Dados inseridos!</p>
                <nav>
                    <ul class="local">
                        <li>
                            <a class="btn btn-neon" title="Acessar Perfil" href="http://VicttoriaLemos.github.io/Jogador/listar">ACESSAR
                                PERFIL</a>
                        </li>
                    </ul>
                </nav>
                </div>
                <footer>
                    <a href="https://victtorialemos.github.io/Jogadores.github.io/">VOLTAR</a>
                </footer>
            </body>
            </html>`);
        } else {
            console.log("Não foi possível inserir os dados ", err);
            res.send(`   <!DOCTYPE html>
            <html lang="pt-br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PLAY AGAIN?</title>
                <link rel="icon" type="image/x-icon" href="icon.png">
                <link rel="stylesheet" type="text/css" href="/estilo.css">
            </head>

             <body class="site">
                <div class="bg1">
                    <h1></h1>
                </div>

            <div class="site-content bg2">
                <p>ERRO!</p>
            </div> 

            <footer>
                <a href="https://victtorialemos.github.io/Jogadores.github.io/">VOLTAR</a>
            </footer>

            </body>
            </html>`)
        }
    })

})

app.get("/listar", function (req, res) {

    const selectAll = "SELECT usuario, nick, bio, cidade,estado,imagem,id_jogador FROM  usuarios";

    connection.query(selectAll, function (err, rows) {
        if (!err) {
            res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro Jogador</title>
                <link rel="icon" type="image/x-icon" href="icon.png">
                <link rel="stylesheet" type="text/css" href="/estilo.css">
            </head>
            <body class="site">
            <div class="bg1">
                <h1>PERFIL</h1>
            </div>
            <div class="site-content bg2">
                <div class="tabela">
                    <table>
                        <tr>
                            <th> Usuário </th>
                            <th> Nickname </th>
                            <th> Bio </th>
                            <th> Cidade </th>
                            <th> Estado </th>
                            <th> Avatar </th>
                            <th> Deletar </th>
                        </tr>
                        ${rows.map(row => `
                        <tr>
                            <td>${row.usuario}</td>
                            <td>${row.nick}</td>
                            <td>${row.bio}</td>
                            <td>${row.cidade}</td>
                            <td>${row.estado}</td>
                            <td><img src="/uploads/${row.imagem}" atl="Imagem de Perfil" style="width:150px; heigth:48px;"></td>
                            <td><a href="/deletar/${row.id_jogador}">Deletar</a></td>
                        </tr>
                        `).join('')}
                    </table>
        
                </div>
            </div>
        
            <footer>
                <a href="https://victtorialemos.github.io/Jogadores.github.io/">VOLTAR</a>
            </footer>
        </body>
        
        </html>
         `);
        } else {
            console.log("Erro ao listar Jogadores! ", err);
            res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PLAY AGAIN?</title>
                <link rel="icon" type="image/x-icon" href="icon.png">
                <link rel="stylesheet" type="text/css" href="/estilo.css">
            </head>

             <body class="site">
                <div class="bg1">
                    <h1></h1>
                </div>

            <div class="site-content bg2">
                <p>ERRO!</p>
            </div> 

            <footer>
                <a href="https://victtorialemos.github.io/Jogadores.github.io/">VOLTAR</a>
            </footer>

            </body>
            </html>
            `)
        }
    })
})

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get("/deletar/:id_jogador", function (req, res) {
    const id_jogador = req.params.id_jogador;

    const deleteusuarios = "DELETE FROM usuarios Where id_jogador =?";

    connection.query(deleteusuarios, [id_jogador], function (err, result) {
        if (!err) {
            console.log("Jogador deleteado!");
            res.redirect('/listar');
        } else {
            console.log("Erro ao deletar jogador:", err)
        }

    })
});
/*
app.get("/atualizar-form/:id_jogador", upload.single('imagem'), function (req, res) {
    const id_jogador = req.params.id_jogador;

    const selectusuarios = "SELECT * FROM usuarios WHERE id_jogador=?";

    connection.query(selectusuarios, [id_jogador], function (err, result) {

        if (!err && result.length > 0) {
            const usuarios = result[0];

            res.send(`
            <html>
            <head>
            <title>Atualizar Perfil</title>
            <link rel="icon" type="image/x-icon" href="icon.png">
            </head>
            <body>
                <h1>Atualizar Perfil </h1>
                <form action="/atualizar/${id_jogador}" method = "POST">

                    <label for="usuario">Usuário</label>
                    <input type="text" id="usuario" name=""usuario" value="${usuarios.usuario}" required><br>

                    <label for="senha">Senha</label>
                    <input type="password" id="senha" name=""senha" value="${usuarios.senha}" required><br>


                    <label for="nick">Nickname</label>
                    <input type="text" id="nick" name=""nick" value="${usuarios.nick}" required><br>

                    <label for="bio">Bio</label>
                    <input type="text" id="bio" name=""bio" value="${usuarios.bio}" ><br>

                    <label for="cidade">Cidade</label>
                    <input type="text" id="cidade" name=""cidade" value="${usuarios.cidade}" required><br>

                    <label for="estado"></label>
                    <select name="estado"  id="estado" value="${usuarios.estado}" required>
                        <option value="">UF</option>
                        <option value="ac">AC</option>
                        <option value="ap">AP</option>
                        <option value="am">AM</option>
                        <option value="ba">BA</option>
                        <option value="ce">CE</option>
                        <option value="df">DF</option>
                        <option value="es">ES</option>
                        <option value="go">GO</option>
                        <option value="ma">MA</option>
                        <option value="mt">MT</option>
                        <option value="ms">MS</option>
                        <option value="mg">MG</option>
                        <option value="pa">PA</option>
                        <option value="pb">PB</option>
                        <option value="pr">PR</option>
                        <option value="pe">PE</option>
                        <option value="pi">PI</option>
                        <option value="rj">RJ</option>
                        <option value="rn">RN</option>
                        <option value="rs">RS</option>
                        <option value="ro">RO</option>
                        <option value="pr">PR</option>
                        <option value="sc">SC</option>
                        <option value="to">TO</option>
                    </select>

                    <label for="imagem"></label>
                    <input type="file" id="imagem" name="imagem" value="${usuarios.imagem}" accept="imagem/*"><br>

                    <input type="submit" value="Atualizar"
            </body>
            </html>
            
            `);

        } else {
            console.log("Erro ao obter dado de Jogador.", err);
        }
    });
});


app.post('/atualizar/:id_jogador',(req, res) => {
    const id_jogador = req.params.id_jogador;
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    const nick = req.body.nick;
    const bio = req.body.bio;
    const cidade = req.body.cidade;
    const estado = req.body.estado;
    const imagem = req.body.imagem


    const updateQuery = "UPDATE usuarios SET usuario =?, senha =?, nick =?, bio =?, cidade =?, estado =?,imagem =? WHERE id_jogador =?";

    connection.query(updateQuery, [usuario, senha, nick, bio, cidade, estado,imagem, id_jogador], function (err, result) {
        if (!err) {
            console.log("Dados atualizados.")
            res.send("Dados atualizados.")
        } else {
            console.log("Erro ao atualizar dados", err);
        }
    });

});*/

app.listen(8081, function () {
    console.log("Servidor rodando na url http://localhost:8081")
})
