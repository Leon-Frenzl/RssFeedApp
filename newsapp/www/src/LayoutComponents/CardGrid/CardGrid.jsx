import { Card } from "../Card/Card";
import './CardGrid.css'

export const CardGrid = ({cards}) => {
    return (
        <div className="card-grid">
          {cards.map((card) => (
            <Card key={card.id} image={card.image} title={card.title} text={card.text} />
          ))}
        </div>
      );
    };