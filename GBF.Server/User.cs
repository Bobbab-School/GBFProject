using System;
using System.Data;
using BCrypt.Net;
using Microsoft.Data.SqlClient;
using System.ComponentModel.DataAnnotations;


public class User
{
	public int UserId { get; set; }
	public string Username { get; set; }
	public string PassHash { get; set; }
    public User()
    {
       
    }

    public User(string username, string password)
	{
		Username = username;
		PassHash = BCrypt.Net.BCrypt.HashPassword(password);
	}
}
public class AccountCollection
{
    public int UserId { get; set; }
    public int CharacterId { get; set; }
    public int Awakening { get; set; }
    public int Completion { get; set; }

    public GameCharacter Character { get; set; }
}

public class GameCharacter
{
    [Key]
    public int CharId { get; set; }
    public string Name { get; set; }
    public string Rarity { get; set; }
    public string Element { get; set; }
    public string Series { get; set; }
    public string SeriesTwo { get; set; }
    public string Weapon { get; set; }
    public string WeaponTwo { get; set; }
    public string Race { get; set; }
    public string RaceTwo { get; set; }
    public string CharUrl { get; set; }

    // Navigation collection
    public ICollection<AccountCollection> AccountCollections { get; set; }
}

