
import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'bg-primary-500' }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className={`p-4 rounded-full text-white mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold font-heading">{value}</p>
            </div>
        </div>
    );
};

export default Card;
