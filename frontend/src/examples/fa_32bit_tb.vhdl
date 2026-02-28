library ieee;
use ieee.std_logic_1164.all;

entity fa_32bit_tb is
end fa_32bit_tb;

architecture test of fa_32bit_tb is
	component fa_32bit
		port
		(
			x, y : in std_ulogic_vector(31 downto 0);
			sm : out std_ulogic_vector(31 downto 0);
			co : out std_ulogic
		);
	end component;
	
	signal x, y, sm : std_ulogic_vector(31 downto 0); 
	signal co : std_ulogic;
	
begin
	fa: fa_32bit port map (x, y, sm, co);
	
	process begin
		x <= "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
		y <= "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
		wait for 1 ns;
		
		x <= X"00000000";
		y <= X"00000000";
		wait for 1 ns;
		
		x <= X"00000000";
		y <= X"11111111";
		wait for 1 ns;
		
		x <= X"11111111";
		y <= X"00000000";
		wait for 1 ns;
		
		x <= X"10101010";
		y <= X"01010101";
		wait for 1 ns;
		
		x <= X"00000000";
		y <= X"00000000";
		wait for 1 ns;
		
		x <= X"00000000";
		y <= X"FFFFFFFF";
		wait for 1 ns;
		
		x <= X"FFFFFFFF";
		y <= X"00000000";
		wait for 1 ns;
		
		x <= X"AAAAAAAA";
		y <= X"55555555";
		wait for 1 ns;
		
		x <= X"FFFFFFFF";
		y <= X"00000001";
		wait for 1 ns;
		
		assert false report "End of Test";
		wait;
		
	end process;
end test;