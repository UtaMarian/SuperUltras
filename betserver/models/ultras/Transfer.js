const TransferSchema = new Schema({
    player: { type: Schema.Types.ObjectId, ref: 'UltrasTeamPlayer', required: true },
    fromTeam: { type: Schema.Types.ObjectId, ref: 'UltrasTeam', required: true },
    toTeam: { type: Schema.Types.ObjectId, ref: 'UltrasTeam', required: true },
    transferDate: { type: Date, required: true },
    transferFee: { type: Number, default: 0 } // Transfer fee in millions
  }, { timestamps: true });
  
  const TransferModel = model('Transfer', TransferSchema);
  module.exports = TransferModel;
  