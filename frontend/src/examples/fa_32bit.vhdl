library ieee;
use ieee.std_logic_1164.all;

entity fa_32bit is
	port
	(
		x, y : in std_ulogic_vector(31 downto 0);
		sm : out std_ulogic_vector(31 downto 0);
		co : out std_ulogic
	);
end fa_32bit;

architecture behave of fa_32bit is
	signal carry : std_ulogic_vector(30 downto 0);
	component ha is
		port
		(
			a, b : in std_ulogic;
			sum, carry : out std_ulogic
		);
	end component;

	component fa is
		port
		(
			a, b, c : in std_ulogic;
			sum, carry : out std_ulogic
		);
	end component;
	
begin
	ha0: ha port map (x(0), y(0), sm(0), carry(0));
	fa1: fa port map (x(1), y(1), carry(0), sm(1), carry(1));
	fa2: fa port map (x(2), y(2), carry(1), sm(2), carry(2));
	fa3: fa port map (x(3), y(3), carry(2), sm(3), carry(3));
	fa4: fa port map (x(4), y(4), carry(3), sm(4), carry(4));
	fa5: fa port map (x(5), y(5), carry(4), sm(5), carry(5));
	fa6: fa port map (x(6), y(6), carry(5), sm(6), carry(6));
	fa7: fa port map (x(7), y(7), carry(6), sm(7), carry(7));
	fa8: fa port map (x(8), y(8), carry(7), sm(8), carry(8));
	fa9: fa port map (x(9), y(9), carry(8), sm(9), carry(9));
	fa10: fa port map (x(10), y(10), carry(9), sm(10), carry(10));
	fa11: fa port map (x(11), y(11), carry(10), sm(11), carry(11));
	fa12: fa port map (x(12), y(12), carry(11), sm(12), carry(12));
	fa13: fa port map (x(13), y(13), carry(12), sm(13), carry(13));
	fa14: fa port map (x(14), y(14), carry(13), sm(14), carry(14));
	fa15: fa port map (x(15), y(15), carry(14), sm(15), carry(15));
	fa16: fa port map (x(16), y(16), carry(15), sm(16), carry(16));
	fa17: fa port map (x(17), y(17), carry(16), sm(17), carry(17));
	fa18: fa port map (x(18), y(18), carry(17), sm(18), carry(18));
	fa19: fa port map (x(19), y(19), carry(18), sm(19), carry(19));
	fa20: fa port map (x(20), y(20), carry(19), sm(20), carry(20));
	fa21: fa port map (x(21), y(21), carry(20), sm(21), carry(21));
	fa22: fa port map (x(22), y(22), carry(21), sm(22), carry(22));
	fa23: fa port map (x(23), y(23), carry(22), sm(23), carry(23));
	fa24: fa port map (x(24), y(24), carry(23), sm(24), carry(24));
	fa25: fa port map (x(25), y(25), carry(24), sm(25), carry(25));
	fa26: fa port map (x(26), y(26), carry(25), sm(26), carry(26));
	fa27: fa port map (x(27), y(27), carry(26), sm(27), carry(27));
	fa28: fa port map (x(28), y(28), carry(27), sm(28), carry(28));
	fa29: fa port map (x(29), y(29), carry(28), sm(29), carry(29));
	fa30: fa port map (x(30), y(30), carry(29), sm(30), carry(30));
	fa31: fa port map (x(31), y(31), carry(30), sm(31), co);
end behave;