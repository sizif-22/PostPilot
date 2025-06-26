"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { EngagementData, PlatformComparisonData, AudienceDemographics } from './types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const EngagementTrendsChart = ({ data }: { data: EngagementData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Facebook" stroke="#3b5998" />
      <Line type="monotone" dataKey="Instagram" stroke="#e1306c" />
    </LineChart>
  </ResponsiveContainer>
);

export const PlatformComparisonChart = ({ data }: { data: PlatformComparisonData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="metric" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="Facebook" fill="#3b5998" />
      <Bar dataKey="Instagram" fill="#e1306c" />
    </BarChart>
  </ResponsiveContainer>
);

export const AudienceDemographicsChart = ({ data }: { data: AudienceDemographics }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <h3 className="text-lg font-semibold text-center">Age Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={Object.entries(data.age).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
            {Object.entries(data.age).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-center">Gender Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={Object.entries(data.gender).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#82ca9d">
             {Object.entries(data.gender).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-center">Location Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={Object.entries(data.location).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#ffc658">
            {Object.entries(data.location).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
