library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity adder_tb is
end adder_tb;

architecture Behavioral of adder_tb is
  component adder is
    Port (
      a : in unsigned(7 downto 0);
      b : in unsigned(7 downto 0);
      sum : out unsigned(7 downto 0);
      carry : out std_logic
    );
  end component;

  signal a : unsigned(7 downto 0) := X"00";
  signal b : unsigned(7 downto 0) := X"00";
  signal sum : unsigned(7 downto 0);
  signal carry : std_logic;

begin
  uut: adder port map (a, b, sum, carry);

  process
  begin
    a <= X"05"; b <= X"03";
    wait for 10 ns;
    a <= X"FF"; b <= X"01";
    wait for 10 ns;
    a <= X"50"; b <= X"50";
    wait for 10 ns;
    wait;
  end process;
end Behavioral;
