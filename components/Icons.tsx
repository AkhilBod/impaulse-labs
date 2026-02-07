import React from 'react';
import { 
  Settings, 
  Mail, 
  Home, 
  Plus, 
  User, 
  Info, 
  Clock, 
  Shuffle, 
  Archive, 
  ChevronRight,
  ArrowLeft,
  Camera,
  Briefcase,
  Plane,
  Car,
  Heart,
  ShieldAlert,
  PiggyBank,
  Check,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export const Icons = {
  Settings,
  Mail,
  Home,
  Plus,
  User,
  Info,
  Clock,
  Shuffle,
  Archive,
  ChevronRight,
  ArrowLeft,
  Camera,
  Briefcase,
  Plane,
  Car,
  Heart,
  ShieldAlert,
  PiggyBank,
  Check,
  TrendingUp,
  DollarSign,
  AlertTriangle
};

// Simple shapes for the "Envelopes" illustration simulation
export const EnvelopeIllustration = () => (
  <div className="relative w-64 h-40 mx-auto my-6">
    {/* Back Envelope (Green) */}
    <div className="absolute top-0 left-0 w-40 h-28 bg-green-200 rounded-lg transform -rotate-12 translate-x-4 shadow-sm z-0 flex items-center justify-center border-2 border-green-300">
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-green-400 border-r-[10px] border-r-transparent absolute top-0"></div>
    </div>
     {/* Back Envelope (Yellow) */}
     <div className="absolute top-[-10px] left-20 w-40 h-28 bg-yellow-200 rounded-lg transform rotate-6 shadow-sm z-10 border-2 border-yellow-300">
         <div className="w-full flex justify-center"><div className="w-0 h-0 border-l-[80px] border-l-transparent border-t-[50px] border-t-yellow-300/50 border-r-[80px] border-r-transparent"></div></div>
    </div>
    
     {/* Middle Envelope (Orange) */}
     <div className="absolute top-10 left-[-20px] w-44 h-32 bg-orange-300 rounded-lg transform -rotate-3 shadow-md z-20 flex items-center justify-center border-b-4 border-orange-400">
        <div className="absolute top-0 w-0 h-0 border-l-[88px] border-l-transparent border-t-[60px] border-t-orange-400/50 border-r-[88px] border-r-transparent"></div>
    </div>

    {/* Front Right Envelope (Blue) */}
    <div className="absolute top-12 left-32 w-44 h-32 bg-blue-400 rounded-lg transform rotate-2 shadow-md z-30 border-b-4 border-blue-500">
        <div className="absolute top-0 w-full flex justify-center">
             <div className="w-0 h-0 border-l-[88px] border-l-transparent border-t-[60px] border-t-blue-500/50 border-r-[88px] border-r-transparent"></div>
        </div>
    </div>

    {/* Front Center Envelope (Purple) */}
    <div className="absolute top-16 left-12 w-48 h-32 bg-purple-400 rounded-xl transform rotate-0 shadow-lg z-40 border-b-4 border-purple-500">
         <div className="absolute top-0 w-full flex justify-center">
             <div className="w-0 h-0 border-l-[96px] border-l-transparent border-t-[65px] border-t-purple-500/50 border-r-[96px] border-r-transparent"></div>
        </div>
    </div>
  </div>
);
