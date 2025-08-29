
import React, { ReactNode } from 'react';

interface ChartContainerProps {
    title: string;
    children: ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-heading text-gray-700 mb-4">{title}</h3>
            <div className="h-72">
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;
