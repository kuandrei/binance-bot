'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Deals', 'buyQty', {
            allowNull: false,
            type: Sequelize.DECIMAL(16, 8),
            after: 'symbol'
        });
        await queryInterface.addColumn('Deals', 'sellQty', {
            allowNull: false,
            type: Sequelize.DECIMAL(16, 8),
            after: 'buyQty'
        });
        await queryInterface.sequelize.query(`
          UPDATE Deals d SET 
          d.buyQty=(SELECT o1.quantity FROM Orders o1 WHERE o1.dealId=d.id AND o1.side='BUY' AND o1.status='FILLED'), 
          d.sellQty=(SELECT o2.quantity FROM Orders o2 WHERE o2.dealId=d.id AND o2.side='SELL' AND o2.status='FILLED')
          WHERE d.status='CLOSED'
        `);
        await queryInterface.sequelize.query(`
          UPDATE Deals d SET 
          d.buyQty=d.quantity
          WHERE d.buyQty=0
        `);
        await queryInterface.sequelize.query(`
          UPDATE Deals d SET 
          d.sellQty=d.quantity
          WHERE d.sellQty=0
        `);
        return queryInterface.removeColumn('Deals', 'quantity');
    },

    down: () => {
    }
};
