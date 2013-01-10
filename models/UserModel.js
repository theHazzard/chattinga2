var mongo = require('mongoose'), pctr;
var Chat = require('./ChatModel').Chat;


var UserModel = mongo.Schema({
	RedSocialId: { type: Number, unique: true, required: true },
	RedSocialNombre: { type: String, required: true },
	NombreUsuario: { type: String, required: true },
	Foto: { type: String, required: true },
	FechaCreacion: { type: Date, default: Date.now },
	UltimoLogin: Date,
	_chats: [{ type : mongo.Schema.Types.ObjectId, ref: 'Chat'}]
});

UserModel.statics.findOrCreate = function (User,cb){
	var este = this;
	this.findOne({ RedSocialId: User.id }, function (err,us){
		if (err) { console.log(err) };
		if (!us){
			if (User.provider == 'facebook'){
				pctr = 'https://graph.facebook.com/'+User.id+'/picture?width=25&height=25';
			} else {
				pctr = User._json.profile_image_url;
			}
			este.create({
				RedSocialId: User.id,
				RedSocialNombre: User.provider,
				NombreUsuario: User.displayName,
				Foto: pctr
			}, function (err, usr){
				console.log('creado usuario '+usr);
				cb(null,usr);
			});
		} else {
			console.log('usuario encontrado'+us);
			cb(null,us);
		}
	});
};

exports.Usuario = mongo.model('User', UserModel);
