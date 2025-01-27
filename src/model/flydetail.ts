import { currentTime, setlog } from "../helper";

// declare interface SchemaFlyDetailModel {
//   _id: number
//   betStartTime: number
//   betEndTime: number
//   flyStartTime: number
//   totalUsers: number
//   totalBets: number
//   totalBetsAmount: number
//   totalCashout: number
//   totalCashoutAmount: number
//   flyAway: number
//   flyEndTime: number
// }

import mongoose, { Types } from "mongoose";

const FlyDetailSchema = new mongoose.Schema({
  flyDetailID: {
    type: String,
  },
  betStartTime: {
    type: Date,
  },
  betEndTime: {
    type: Date,
  },
  flyStartTime: {
    type: Date,
  },
  totalUsers: {
    type: Number,
  },
  totalBets: {
    type: Number,
  },
  totalBetsAmount: {
    type: Number,
  },
  totalCashout: {
    type: Number,
  },
  totalCashoutAmount: {
    type: Number,
  },
  flyAway: {
    type: Number,
  },
  flyEndTime: {
    type: Date,
  },
}, {
  timestamps: true,
  versionKey: false
});


const FlyDetailModel = mongoose.model("flydetail", FlyDetailSchema);

export const getAllFlyDetail = async () => {
  try {
    const flydetails = await FlyDetailModel.find({})
    return {
      status: true,
      data: flydetails
    }
  } catch (error) {
    setlog('getAllFlyDetail', error)
    return { status: false, message: "Something went wrong." }
  }
}

export const addFlyDetail = async (
  flyDetailID: string,
  betStartTime: number,
  betEndTime: number,
  flyStartTime: number,
  totalUsers: number,
  totalBets: number,
  totalBetsAmount: number,
  totalCashout: number,
  totalCashoutAmount: number,
  flyAway: number,
  flyEndTime: number,
) => {
  try {
    await FlyDetailModel.create({
      flyDetailID,
      betStartTime,
      betEndTime,
      flyStartTime,
      totalUsers,
      totalBets,
      totalBetsAmount,
      totalCashout,
      totalCashoutAmount,
      flyAway,
      flyEndTime
    })
    return {
      _id: flyDetailID,
      status: true
    }
  } catch (error) {
    setlog('addFlyDetail', error)
    return false
  }
}

export const updateFlyDetail = async (
  flyDetailID: string,
  updateData: object,
) => {
  try {
    await FlyDetailModel.findOneAndUpdate({ flyDetailID }, {
      $set: updateData
    })
    return true
  } catch (error) {
    setlog('updateFlyDetail', error)
    return false
  }
}

export const updateFlyDetailByUserId = async (
  betId: string,
  updateData: object,
) => {
  try {
    await FlyDetailModel.findOneAndUpdate({ betId }, {
      $set: updateData
    })
    return true
  } catch (error) {
    setlog('updateFlyDetail', error)
    return false
  }
}

export const deleteFlyDetail = async (
  _id: number
) => {
  try {
    await FlyDetailModel.deleteOne({ _id: new Types.ObjectId(_id) })
    return true
  } catch (error) {
    setlog('deleteFlyDetail', error)
    return false
  }
}

export default FlyDetailModel;