import { useEffect, useState } from 'react';

export function AnimatedLogo() {
  const [activeDots, setActiveDots] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    // Function to randomly select 2-5 dots
    const selectRandomDots = () => {
      const totalDots = 148; // Total number of circles in the SVG
      const numDots = Math.floor(Math.random() * 4) + 2; // 2-5 dots
      const newActiveDots = new Set<number>();
      
      while (newActiveDots.size < numDots) {
        const randomIndex = Math.floor(Math.random() * totalDots);
        newActiveDots.add(randomIndex);
      }
      
      setActiveDots(newActiveDots);
    };
    
    // Initial selection
    selectRandomDots();
    
    // Update every second
    const interval = setInterval(selectRandomDots, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <svg width="634" height="82" viewBox="0 0 634 82" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[400px] h-auto">
      {/* L */}
      <circle cx="5" cy="17" r="5" fill={activeDots.has(0) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="5" cy="29" r="5" fill={activeDots.has(1) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="5" cy="41" r="5" fill={activeDots.has(2) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="5" cy="53" r="5" fill={activeDots.has(3) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="5" cy="65" r="5" fill={activeDots.has(4) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="5" cy="77" r="5" fill={activeDots.has(5) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="17" r="5" fill={activeDots.has(6) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="29" r="5" fill={activeDots.has(7) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="41" r="5" fill={activeDots.has(8) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="53" r="5" fill={activeDots.has(9) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="65" r="5" fill={activeDots.has(10) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="17" cy="77" r="5" fill={activeDots.has(11) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="29" cy="77" r="5" fill={activeDots.has(12) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="41" cy="77" r="5" fill={activeDots.has(13) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="53" cy="77" r="5" fill={activeDots.has(14) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* I */}
      <circle cx="77" cy="29" r="5" fill={activeDots.has(15) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="77" cy="77" r="5" fill={activeDots.has(16) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="89" cy="29" r="5" fill={activeDots.has(17) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="89" cy="77" r="5" fill={activeDots.has(18) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="5" r="5" fill={activeDots.has(19) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="29" r="5" fill={activeDots.has(20) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="41" r="5" fill={activeDots.has(21) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="53" r="5" fill={activeDots.has(22) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="65" r="5" fill={activeDots.has(23) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="101" cy="77" r="5" fill={activeDots.has(24) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="113" cy="29" r="5" fill={activeDots.has(25) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="113" cy="41" r="5" fill={activeDots.has(26) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="113" cy="53" r="5" fill={activeDots.has(27) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="113" cy="65" r="5" fill={activeDots.has(28) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="113" cy="77" r="5" fill={activeDots.has(29) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="125" cy="77" r="5" fill={activeDots.has(30) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* F */}
      <circle cx="149" cy="41" r="5" fill={activeDots.has(31) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="149" cy="77" r="5" fill={activeDots.has(32) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="161" cy="29" r="5" fill={activeDots.has(33) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="161" cy="41" r="5" fill={activeDots.has(34) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="161" cy="53" r="5" fill={activeDots.has(35) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="161" cy="65" r="5" fill={activeDots.has(36) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="161" cy="77" r="5" fill={activeDots.has(37) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="17" r="5" fill={activeDots.has(38) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="29" r="5" fill={activeDots.has(39) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="41" r="5" fill={activeDots.has(40) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="53" r="5" fill={activeDots.has(41) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="65" r="5" fill={activeDots.has(42) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="173" cy="77" r="5" fill={activeDots.has(43) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="185" cy="17" r="5" fill={activeDots.has(44) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="185" cy="41" r="5" fill={activeDots.has(45) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="185" cy="77" r="5" fill={activeDots.has(46) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="197" cy="17" r="5" fill={activeDots.has(47) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="197" cy="41" r="5" fill={activeDots.has(48) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* E */}
      <circle cx="221" cy="41" r="5" fill={activeDots.has(49) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="221" cy="53" r="5" fill={activeDots.has(50) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="221" cy="65" r="5" fill={activeDots.has(51) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="233" cy="29" r="5" fill={activeDots.has(52) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="233" cy="41" r="5" fill={activeDots.has(53) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="233" cy="53" r="5" fill={activeDots.has(54) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="233" cy="65" r="5" fill={activeDots.has(55) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="233" cy="77" r="5" fill={activeDots.has(56) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="245" cy="29" r="5" fill={activeDots.has(57) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="245" cy="53" r="5" fill={activeDots.has(58) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="245" cy="77" r="5" fill={activeDots.has(59) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="257" cy="29" r="5" fill={activeDots.has(60) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="257" cy="53" r="5" fill={activeDots.has(61) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="257" cy="77" r="5" fill={activeDots.has(62) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="269" cy="41" r="5" fill={activeDots.has(63) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="269" cy="53" r="5" fill={activeDots.has(64) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="269" cy="77" r="5" fill={activeDots.has(65) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* L */}
      <circle cx="293" cy="17" r="5" fill={activeDots.has(66) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="293" cy="29" r="5" fill={activeDots.has(67) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="293" cy="41" r="5" fill={activeDots.has(68) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="293" cy="53" r="5" fill={activeDots.has(69) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="293" cy="65" r="5" fill={activeDots.has(70) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="293" cy="77" r="5" fill={activeDots.has(71) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="17" r="5" fill={activeDots.has(72) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="29" r="5" fill={activeDots.has(73) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="41" r="5" fill={activeDots.has(74) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="53" r="5" fill={activeDots.has(75) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="65" r="5" fill={activeDots.has(76) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="305" cy="77" r="5" fill={activeDots.has(77) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="317" cy="77" r="5" fill={activeDots.has(78) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="329" cy="77" r="5" fill={activeDots.has(79) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="341" cy="77" r="5" fill={activeDots.has(80) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* I */}
      <circle cx="365" cy="29" r="5" fill={activeDots.has(81) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="365" cy="77" r="5" fill={activeDots.has(82) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="377" cy="29" r="5" fill={activeDots.has(83) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="377" cy="77" r="5" fill={activeDots.has(84) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="5" r="5" fill={activeDots.has(85) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="29" r="5" fill={activeDots.has(86) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="41" r="5" fill={activeDots.has(87) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="53" r="5" fill={activeDots.has(88) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="65" r="5" fill={activeDots.has(89) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="389" cy="77" r="5" fill={activeDots.has(90) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="401" cy="29" r="5" fill={activeDots.has(91) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="401" cy="41" r="5" fill={activeDots.has(92) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="401" cy="53" r="5" fill={activeDots.has(93) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="401" cy="65" r="5" fill={activeDots.has(94) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="401" cy="77" r="5" fill={activeDots.has(95) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="413" cy="77" r="5" fill={activeDots.has(96) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* N */}
      <circle cx="437" cy="29" r="5" fill={activeDots.has(97) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="437" cy="41" r="5" fill={activeDots.has(98) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="437" cy="53" r="5" fill={activeDots.has(99) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="437" cy="65" r="5" fill={activeDots.has(100) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="437" cy="77" r="5" fill={activeDots.has(101) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="449" cy="41" r="5" fill={activeDots.has(102) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="449" cy="53" r="5" fill={activeDots.has(103) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="449" cy="65" r="5" fill={activeDots.has(104) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="449" cy="77" r="5" fill={activeDots.has(105) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="461" cy="29" r="5" fill={activeDots.has(106) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="473" cy="29" r="5" fill={activeDots.has(107) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="473" cy="41" r="5" fill={activeDots.has(108) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="485" cy="41" r="5" fill={activeDots.has(109) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="485" cy="53" r="5" fill={activeDots.has(110) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="485" cy="65" r="5" fill={activeDots.has(111) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="485" cy="77" r="5" fill={activeDots.has(112) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* E */}
      <circle cx="509" cy="41" r="5" fill={activeDots.has(113) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="509" cy="53" r="5" fill={activeDots.has(114) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="509" cy="65" r="5" fill={activeDots.has(115) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="521" cy="29" r="5" fill={activeDots.has(116) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="521" cy="41" r="5" fill={activeDots.has(117) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="521" cy="53" r="5" fill={activeDots.has(118) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="521" cy="65" r="5" fill={activeDots.has(119) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="521" cy="77" r="5" fill={activeDots.has(120) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="533" cy="29" r="5" fill={activeDots.has(121) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="533" cy="53" r="5" fill={activeDots.has(122) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="533" cy="77" r="5" fill={activeDots.has(123) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="545" cy="29" r="5" fill={activeDots.has(124) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="545" cy="53" r="5" fill={activeDots.has(125) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="545" cy="77" r="5" fill={activeDots.has(126) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="557" cy="41" r="5" fill={activeDots.has(127) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="557" cy="53" r="5" fill={activeDots.has(128) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="557" cy="77" r="5" fill={activeDots.has(129) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      
      {/* S */}
      <circle cx="581" cy="41" r="5" fill={activeDots.has(130) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="581" cy="53" r="5" fill={activeDots.has(131) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="581" cy="77" r="5" fill={activeDots.has(132) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="593" cy="29" r="5" fill={activeDots.has(133) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="593" cy="41" r="5" fill={activeDots.has(134) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="593" cy="53" r="5" fill={activeDots.has(135) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="593" cy="77" r="5" fill={activeDots.has(136) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="605" cy="29" r="5" fill={activeDots.has(137) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="605" cy="53" r="5" fill={activeDots.has(138) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="605" cy="77" r="5" fill={activeDots.has(139) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="617" cy="29" r="5" fill={activeDots.has(140) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="617" cy="53" r="5" fill={activeDots.has(141) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="617" cy="65" r="5" fill={activeDots.has(142) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="617" cy="77" r="5" fill={activeDots.has(143) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="629" cy="29" r="5" fill={activeDots.has(144) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="629" cy="53" r="5" fill={activeDots.has(145) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
      <circle cx="629" cy="65" r="5" fill={activeDots.has(146) ? "#FFEB3B" : "#D9D9D9"} className="transition-all duration-300"/>
    </svg>
  );
}