
const applyStatus = {
  waitingApproval: 1, // 等待审核
  approved:  2, // 审核通过
  rejected: 3 // 审核未通过
}

const privacy = {
  public: 1, // 公开
  needApply: 2 // 需申请访问
}

const auth = {
  read: 1 // 允许查看
}

module.exports = {
  applyStatus,
  privacy
}
