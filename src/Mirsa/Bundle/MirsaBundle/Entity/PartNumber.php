<?php
/**
 * Stock
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 * Added stockQantities as a link to the StockQuantity
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Stock entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Stock")
 *
 * @Serializer\XmlRoot("stock")
 * @Serializer\ExclusionPolicy("all")
 */
class PartNumber
{
    /**
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="string")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Internal_Stk_Code", type="string")
     * @Serializer\Expose
     */
    protected $sku;

    /**
     * @ORM\Column(name="Description", type="string")
     * @Serializer\Expose
     */
    protected $description;
    
    /**
     * @ORM\Column(name="Customer_Account_No", type="string")
     * @Serializer\Expose
     */
    protected $customerAccountNumber;    
    
    function getId() {
        return $this->id;
    }

    function getSku() {
        return $this->sku;
    }

    function getDescription() {
        return $this->description;
    }
    function getCustomerAccountNumber() {
        return $this->customerAccountNumber;
    }



}
