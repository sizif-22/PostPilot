export interface SelectProps {
     name: string;
     value: string;
     label?: string;
     options: { name: string; value: string }[];
     onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
     className?: string;
   }
   
   export const Select = ({
     name,
     value,
     label,
     options = [],
     onChange,
     className,
   }: SelectProps) => (
     <div className={`relative ${className} `}>
       {label && (
         <label
           htmlFor={name}
           className="mb-2 block font-medium text-slate-800 dark:text-white">
           {label}
         </label>
       )}
       <div className="relative">
         <select
           id={name}
           name={name}
           value={value}
           onChange={onChange}
           className="cursor-pointer calendar-select w-full rounded-lg border dark:text-white dark:border-darkBorder dark:bg-darkButtons border-stone-300 py-1 pl-2 pr-6 text-sm font-medium text-stone-900 bg-[#21212101] focus:outline-none sm:py-1.5 sm:pl-3 sm:pr-8 lg:py-2.5"
           required>
           {options.map((option) => (
             <option
               key={option.value}
               value={option.value}
               className=" bg-[#21212100] dark:bg-darkBackground outline-none border-none">
               {option.name}
             </option>
           ))}
         </select>
         <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-1">
           <svg
             className="size-4 sm:size-5 text-slate-600"
             viewBox="0 0 20 20"
             fill="currentColor"
             aria-hidden="true">
             <path
               fillRule="evenodd"
               d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
               clipRule="evenodd"
             />
           </svg>
         </span>
       </div>
     </div>
   );
   