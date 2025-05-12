const LevelRepository = require("../repositories/LevelRepository");

class LevelService {
  async createLevel(levelData) {
    const { levelNumber, name, category } = levelData;
    if (!levelNumber || !name || !category) {
      throw new Error("levelNumber, name, and category are required");
    }
    if (!['nursery', 'primary', 'upper_primary', 'secondary', 'higher_secondary', 'tertiary', 'vocational'].includes(category)) {
      throw new Error("Invalid category");
    }
    return LevelRepository.createLevel(levelData);
  }

  async getLevelById(levelId, institutionId) {
    const level = await LevelRepository.getLevelById(levelId, institutionId);
    if (!level) {
      throw new Error("Level not found or does not belong to your institution");
    }
    return level;
  }

  async getAllLevels(institutionId) {
    return LevelRepository.getAllLevels(institutionId);
  }

  async updateLevel(levelId, levelData, institutionId) {
    const level = await LevelRepository.updateLevel(levelId, levelData, institutionId);
    if (!level) {
      throw new Error("Level not found or does not belong to your institution");
    }
    return level;
  }

  async deleteLevel(levelId, institutionId) {
    const level = await LevelRepository.deleteLevel(levelId, institutionId);
    if (!level) {
      throw new Error("Level not found or does not belong to your institution");
    }
    return level;
  }
}

module.exports = new LevelService();