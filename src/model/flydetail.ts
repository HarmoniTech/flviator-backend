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
  betStartTime: {
    type: Number,
  },
  betEndTime: {
    type: Number,
  },
  flyStartTime: {
    type: Number,
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
    type: Number,
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
    let flyDetail: any = await FlyDetailModel.create({
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
      _id: flyDetail._id,
      status: true
    }
  } catch (error) {
    setlog('addFlyDetail', error)
    return false
  }
}

export const updateFlyDetail = async (
  _id: any,
  updateData: object,
) => {
  try {
    await FlyDetailModel.findOneAndUpdate({ _id }, updateData)
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
    await FlyDetailModel.findOneAndUpdate({ betId }, updateData)
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