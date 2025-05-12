const Level = require("../models/Level");

class LevelRepository {
  async createLevel(levelData) {
    return Level.create(levelData);
  }

  async getLevelById(levelId, institutionId) {
    return Level.findOne({ _id: levelId, institution: institutionId }).populate('institution', 'name');
  }

  async getAllLevels(institutionId) {
    return Level.find({ institution: institutionId }).populate('institution', 'name');
  }

  async updateLevel(levelId, levelData, institutionId) {
    return Level.findOneAndUpdate(
        { _id: levelId, institution: institutionId },
        levelData,
        { new: true }
    ).populate('institution', 'name');
  }

  async deleteLevel(levelId, institutionId) {
    return Level.findOneAndDelete({ _id: levelId, institution: institutionId });
  }
}

module.exports = new LevelRepository();