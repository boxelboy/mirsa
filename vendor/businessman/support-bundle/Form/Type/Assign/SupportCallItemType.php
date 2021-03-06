<?php
namespace BusinessMan\Bundle\SupportBundle\Form\Type\Assign;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * SupportCallMessageType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallMessageType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('supportCall', new SupportCallType(), array('data' => $builder->getData()->getSupportCall()));
        $builder->add('description', 'textarea', array('required' => false));
        $builder->add('internal', 'checkbox', array('required' => false, 'disabled' => true));
        $builder->add('emailSupport', 'checkbox', array('required' => false));
        $builder->add('emailClient', 'checkbox', array('required' => false, 'disabled' => true));

        $builder->add('send', 'submit');
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'item';
    }
}
