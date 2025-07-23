const Employee = require('../model/entity/employee.schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const employee = await Employee.findOne({ username });
  if (!employee) return res.status(401).json({ message: "Tài khoản không tồn tại" });

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

  const token = jwt.sign(
    { id: employee._id, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    employee: {
      id: employee._id,
      name: employee.name,
      role: employee.role,
      username: employee.username,
      avatar: employee.avatar,
    }
  });
};


