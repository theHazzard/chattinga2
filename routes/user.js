
/*
 * GET users listing.
 */

exports.findById = function(req, res){
  res.send({id:req.params.id, name: "The Name", description: "description"});
};