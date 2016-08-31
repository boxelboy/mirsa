<?php
/**
 * StockCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * StockCategory
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="ApiData_Stock_Category")
 *
 * @Serializer\XmlRoot("stockcategory")
 * @Serializer\ExclusionPolicy("all")
 */
class StockCategory
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Category_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @ORM\Column(name="Mod_TimeStamp", type="timestamp")
     */
    protected $modified;

    /**
     * @ORM\OneToMany(targetEntity="StockCategory", mappedBy="parent")
     */
    protected $children;

    /**
     * @ORM\ManyToOne(targetEntity="StockCategory", inversedBy="children")
     * @ORM\JoinColumn(name="Parent_ID", referencedColumnName="Category_ID")
     */
    protected $parent;

    public function getId()
    {
        return $this->id;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return null
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getModified()
    {
        return $this->modified;
    }

    public function getParent()
    {
        return $this->parent;
    }

    public function getChildren()
    {
        return $this->children;
    }
}
