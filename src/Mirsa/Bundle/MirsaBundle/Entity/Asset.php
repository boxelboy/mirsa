<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Asset
 *
 * @ORM\Table(name="Assets")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("asset")
 * @Serializer\ExclusionPolicy("all")
 */
class Asset
{
    /**
     * @ORM\Column(name="Asset_ID", type="string")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Asset_Description", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $description;

    /**
     * @ORM\ManyToOne(targetEntity="Contract", inversedBy="assets")
     * @ORM\JoinColumn(name="Contract_No", referencedColumnName="Contract_No")
     */
    protected $contract;

    /**
     * @ORM\ManyToOne(targetEntity="Asset", inversedBy="children")
     * @ORM\JoinColumn(name="Asset_Parent_ID", referencedColumnName="Asset_ID")
     */
    protected $parent;

    /**
     * @ORM\OneToMany(targetEntity="Asset", mappedBy="parent")
     */
    protected $children;

    /**
     * @ORM\OneToMany(targetEntity="SupportCall", mappedBy="asset")
     */
    protected $supportCalls;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getContract()
    {
        return $this->contract;
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
