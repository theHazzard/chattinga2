var mongo = require('mongoose');
var User = require('./UserModel').Usuario;


var ChatModel = mongo.Schema({
	_userId: { type: mongo.Schema.Types.ObjectId, ref: 'User'},
	mensaje: { type: String, required: true },
	Enviado: { type: Date, default: Date.now }
});

ChatModel.statics.Crear = function (usuario, msj, cb){
	this.create({
		_userId: usuario._id,
		mensaje: msj 	
	},function (err, cht){
		console.log(err);
		cb(cht);
	});
};

ChatModel.statics.Ultimos20 = function (cb){
  this.find({})
  .limit(20)
  .sort('-_id')
  .select('_userId mensaje -_id')
  .populate('_userId', 'NombreUsuario Foto')
  .exec(function(err,comments){
  	var comnts = [];
  	for (var c in comments){
  		console.log(comments[c].mensaje);
 		comnts.push({
  			Chat: comments[c].mensaje,
  			Usuario: comments[c]._userId.NombreUsuario,
  			Foto: comments[c]._userId.Foto
  		});
  	}
  	cb(comnts);
  });
};

exports.Chat = mongo.model('Chat', ChatModel);