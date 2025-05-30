import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { enUS } from 'date-fns/locale';
import { DetailsDialog } from './DetailsDialog';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ScheduledPost {
  id: string;
  title: string;
  start: Date;
  end: Date;
  platforms: string[];
  content: string;
  imageUrl?: string[];
}

// Dummy data for demonstration


export const Calendar = ( {dummyScheduledPosts}: {dummyScheduledPosts: ScheduledPost[]} ) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduledPost | null>(null);

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    if (action === 'PREV') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (action === 'NEXT') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setTime(new Date().getTime());
    }
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event: ScheduledPost) => {
    setSelectedEvent(event);
  };

  const eventStyleGetter = (event: ScheduledPost) => {
    return {
      style: {
        backgroundColor: '#8b5cf6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow">
      <div className='flex p-3 h-16 justify-between items-center px-4 border-b border-stone-200'>
        <div>
          <h2 className="font-bold">Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('PREV')}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="text-stone-600" />
          </button>
          <button
            onClick={() => handleNavigate('TODAY')}
            className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <FiCalendar className="text-stone-400" />
            Today
          </button>
          <button
            onClick={() => handleNavigate('NEXT')}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="text-stone-600" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <BigCalendar
          localizer={localizer}
          events={dummyScheduledPosts}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 8rem)'}}
          date={currentDate}
          onNavigate={(date: Date) => setCurrentDate(date)}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
        />
      </div>
      <DetailsDialog selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} open={!!selectedEvent} setOpen={setSelectedEvent} />
    </div>
  );
};
