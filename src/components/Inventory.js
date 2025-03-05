import React from 'react';

function Inventory({ items }) {
  // Map items to more descriptive text and icons for a gothic horror feel
  const getItemDetails = (item) => {
    switch(item) {
      case 'rusty key':
        return {
          name: 'Tarnished Key',
          description: 'Ancient and corroded, stained with what appears to be centuries-old blood. It feels unnaturally cold.',
          icon: '🗝️'
        };
      case 'flashlight':
        return {
          name: 'Failing Lantern',
          description: 'The light dims and flickers as if responding to unseen presences. Sometimes it reveals things better left unseen.',
          icon: '🔦'
        };
      case 'matches':
        return {
          name: 'Sulfur Matches',
          description: 'The flames burn with an eerie blue tint. Each match seems to whisper as it ignites.',
          icon: '🕯️'
        };
      case 'mysterious note':
        return {
          name: 'Blood-Stained Parchment',
          description: 'Written in a frantic hand that deteriorates into madness. Some words appear to have been written in blood.',
          icon: '📜'
        };
      case 'front door key':
        return {
          name: 'Ornate Skeleton Key',
          description: 'Adorned with intricate carvings of tortured souls. It pulses with a faint, malevolent energy.',
          icon: '⚰️'
        };
      default:
        return {
          name: item,
          description: 'A curious artifact of unknown origin.',
          icon: '❓'
        };
    }
  };

  return (
    <div className="inventory">
      <h3>Possessions</h3>
      {items.length === 0 ? (
        <p className="empty-inventory">Your pockets are empty. The darkness seems to close in around you.</p>
      ) : (
        <ul className="inventory-list">
          {items.map((item, index) => {
            const itemDetails = getItemDetails(item);
            return (
              <li 
                key={index} 
                className="inventory-item"
                title={itemDetails.description}
              >
                <span className="item-icon">{itemDetails.icon}</span>
                <span className="item-name">{itemDetails.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Inventory; 