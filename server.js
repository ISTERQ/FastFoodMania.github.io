app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'orders',
        options: { sort: { createdAt: -1 } } // ← Закрываем скобку здесь
      });

    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json({
      username: user.username,
      email: user.email,
      orders: user.orders
    });

  } catch (err) {
    console.error('Ошибка при получении данных пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
