app.get('/', function(req, res){
    res.redirect('https://www.armaduranerd.com.br/2022/05/spy-x-family-deu-vida-ao-famoso-meme-da-anya.html');
});
  
app.get('/user', function(req, res){
    res.send("Redirected to User Page");
});