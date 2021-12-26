"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Store.init(
    {
      name: DataTypes.STRING,
      homepage: DataTypes.STRING,
      cashbackEnabled: DataTypes.BOOLEAN,
      cashbackPercent: DataTypes.DECIMAL,
      cashbackType: DataTypes.STRING,
      network: DataTypes.STRING,
      featured: DataTypes.BOOLEAN,
      isClaimable: DataTypes.BOOLEAN,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Store",
    }
  );
  return Store;
};
