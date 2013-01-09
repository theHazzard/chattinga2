var mongo = require('mongoose');

var ChatModel = mongo.Schema({
	userId: mongo.Schema.Types.ObjectId,
	mensaje: { type: String, required: true },
	Enviado: { type: Date, default: Date.now }
});

ChatModel.statics.Crear = function (usuario, msj, cb){
	this.create({
		userId: usuario,
		mensaje: msj.m 	
	},function (err, cht){
		console.log(err);
		cb(cht);
	});
};

ChatModel.statics.Ultimos20 = function (cb){
  this.find({})
  .limit(20)
  .sort('-_id')
  .lean()
  .exec(function(err,comments){
  	cb(comments);
  });
};

exports.Chat = mongo.model('Chat', ChatModel);