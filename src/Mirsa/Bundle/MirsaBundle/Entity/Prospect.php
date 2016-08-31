<?php

namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Prospect
 *
 * @ORM\Entity()
 * @ORM\Table(name="Prospects")
 *
 * @Serializer\XmlRoot("prospect")
 * @Serializer\ExclusionPolicy("all")
 */
class Prospect
{
    /**
     * @ORM\Column(name="Account_No", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Title", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $title;

    /**
     * @ORM\Column(name="First_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $forename;

    /**
     * @ORM\Column(name="Last_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $surname;

    /**
     * @ORM\Column(name="Source", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $source;

    /**
     * @ORM\Column(name="Client Individual_or_Company", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @ORM\Column(name="Created_Date", type="date")
     * @Serializer\Expose
     * @Serializer\Type("DateTime")
     */
    protected $created;

    /**
     * @ORM\Column(name="Notes", type="string")
     */
    protected $notes;

    /**
     * @ORM\Column(name="Phone", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $phone;

    /**
     * @ORM\Column(name="Phone_Mobile", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $mobile;

    /**
     * @ORM\Column(name="Phone_Skype", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $skype;

    /**
     * @ORM\Column(name="Company_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $name;

    /**
     * @ORM\Column(name="Address_Main_Post_Town", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressTown;

    /**
     * @ORM\Column(name="Address_Main_County", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressCounty;

    /**
     * @ORM\Column(name="Address_Main_Street", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressStreet;

    /**
     * @ORM\Column(name="Address_Main_Post_Code", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressPostcode;

    /**
     * @ORM\Column(name="Address_State", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressState;

    /**
     * @ORM\Column(name="Rating", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $rating;

    /**
     * @ORM\Column(name="Email", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $email;

    /**
     * @ORM\Column(name="Address_Main_Country", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressCountry;

    /**
     * @ORM\Column(name="Address_Main_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $addressName;

    /**
     * getId
     *
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * getTitle
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * setTitle
     *
     * @param string $title New value
     *
     * @return Prospect $this
     */
    public function setTitle($title)
    {
        $this->title = $title;
        return $this;
    }

    /**
     * getForename
     *
     * @return string
     */
    public function getForename()
    {
        return $this->forename;
    }

    /**
     * setForename
     *
     * @param string $forename New value
     *
     * @return Prospect $this
     */
    public function setForename($forename)
    {
        $this->forename = $forename;
        return $this;
    }

    /**
     * getSurname
     *
     * @return string
     */
    public function getSurname()
    {
        return $this->surname;
    }

    /**
     * setSurname
     *
     * @param string $surname New value
     *
     * @return Prospect $this
     */
    public function setSurname($surname)
    {
        $this->surname = $surname;
        return $this;
    }

    /**
     * getSource
     *
     * @return string
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * setSource
     *
     * @param string $source New value
     *
     * @return Prospect $this
     */
    public function setSource($source)
    {
        $this->source = $source;
        return $this;
    }

    /**
     * getType
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * setType
     *
     * @param string $type New value
     *
     * @return Prospect $this
     */
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * getCreated
     *
     * @return DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * setCreated
     *
     * @param DateTime $created New value
     *
     * @return Prospect $this
     */
    public function setCreated($created)
    {
        $this->created = $created;
        return $this;
    }

    /**
     * getNotes
     *
     * @return string
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * setNotes
     *
     * @param string $notes New value
     *
     * @return Prospect $this
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;
        return $this;
    }

    /**
     * getPhone
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->phone;
    }

    /**
     * setPhone
     *
     * @param string $phone New value
     *
     * @return Prospect $this
     */
    public function setPhone($phone)
    {
        $this->phone = $phone;
        return $this;
    }

    /**
     * getMobile
     *
     * @return string
     */
    public function getMobile()
    {
        return $this->mobile;
    }

    /**
     * setMobile
     *
     * @param string $mobile New value
     *
     * @return Prospect $this
     */
    public function setMobile($mobile)
    {
        $this->mobile = $mobile;
        return $this;
    }

    /**
     * getSkype
     *
     * @return string
     */
    public function getSkype()
    {
        return $this->skype;
    }

    /**
     * setSkype
     *
     * @param string $skype New value
     *
     * @return Prospect $this
     */
    public function setSkype($skype)
    {
        $this->skype = $skype;
        return $this;
    }

    /**
     * getName
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * setName
     *
     * @param string $name New value
     *
     * @return Prospect $this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * getAddressTown
     *
     * @return string
     */
    public function getAddressTown()
    {
        return $this->addressTown;
    }

    /**
     * setAddressTown
     *
     * @param string $addressTown New value
     *
     * @return Prospect $this
     */
    public function setAddressTown($addressTown)
    {
        $this->addressTown = $addressTown;
        return $this;
    }

    /**
     * getAddressCounty
     *
     * @return string
     */
    public function getAddressCounty()
    {
        return $this->addressCounty;
    }

    /**
     * setAddressCounty
     *
     * @param string $addressCounty New value
     *
     * @return Prospect $this
     */
    public function setAddressCounty($addressCounty)
    {
        $this->addressCounty = $addressCounty;
        return $this;
    }

    /**
     * getAddressStreet
     *
     * @return string
     */
    public function getAddressStreet()
    {
        return $this->addressStreet;
    }

    /**
     * setAddressStreet
     *
     * @param string $addressStreet New value
     *
     * @return Prospect $this
     */
    public function setAddressStreet($addressStreet)
    {
        $this->addressStreet = $addressStreet;
        return $this;
    }

    /**
     * getAddressPostcode
     *
     * @return string
     */
    public function getAddressPostcode()
    {
        return $this->addressPostcode;
    }

    /**
     * setAddressPostcode
     *
     * @param string $addressPostcode New value
     *
     * @return Prospect $this
     */
    public function setAddressPostcode($addressPostcode)
    {
        $this->addressPostcode = $addressPostcode;
        return $this;
    }

    /**
     * getAddressState
     *
     * @return string
     */
    public function getAddressState()
    {
        return $this->addressState;
    }

    /**
     * setAddressState
     *
     * @param string $addressState New value
     *
     * @return Prospect $this
     */
    public function setAddressState($addressState)
    {
        $this->addressState = $addressState;
        return $this;
    }

    /**
     * getAddressCountry
     *
     * @return string
     */
    public function getAddressCountry()
    {
        return $this->addressCountry;
    }

    /**
     * setAddressCountry
     *
     * @param string $addressCountry New value
     *
     * @return Prospect $this
     */
    public function setAddressCountry($addressCountry)
    {
        $this->addressCountry = $addressCountry;
        return $this;
    }

    /**
     * getAddressName
     *
     * @return string
     */
    public function getAddressName()
    {
        return $this->addressName;
    }

    /**
     * setAddressName
     *
     * @param string $addressName New value
     *
     * @return Prospect $this
     */
    public function setAddressName($addressName)
    {
        $this->addressName = $addressName;
        return $this;
    }

    /**
     * getRating
     *
     * @return string
     */
    public function getRating()
    {
        return $this->rating;
    }

    /**
     * setRating
     *
     * @param string $rating New value
     *
     * @return Prospect $this
     */
    public function setRating($rating)
    {
        $this->rating = $rating;
        return $this;
    }

    /**
     * getEmail
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * setEmail
     *
     * @param string $email New value
     *
     * @return Prospect $this
     */
    public function setEmail($email)
    {
        $this->email = $email;
        return $this;
    }
}
